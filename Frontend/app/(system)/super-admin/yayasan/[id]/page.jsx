"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Landmark,
  School,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Calendar,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Unlink,
  Link2,
  Package,
  Layers,
  Receipt,
  Clock,
  RefreshCw,
} from "lucide-react";

import {
  getYayasanById,
  deleteYayasan,
  getSekolahYayasan,
  updateSekolahYayasan,
  deleteSekolahYayasan,
  getAdminYayasan,
  createAdminYayasan,
  updateAdminYayasan,
  deleteAdminYayasan,
  getDetailYayasanLangganan,
} from "@/services/yayasan.service";
import { getPlatformSekolah } from "@/services/platform.service";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSuccessSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSoft =
  "bg-[color-mix(in_srgb,var(--color-danger,_#ef4444)_9%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger,_#ef4444)_22%,transparent)]";

const inputClass = `
  h-10
  w-full
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  px-3
  text-sm
  theme-text
  outline-none
  transition-all
  placeholder:text-[var(--color-text-placeholder)]
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

const selectClass = `
  h-10
  w-full
  cursor-pointer
  appearance-none
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  pl-3
  pr-8
  text-sm
  theme-text
  outline-none
  transition-all
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

function formatDate(value) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

function formatRupiah(value) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function DetailYayasanSuperAdminPage() {
  const params = useParams();
  const router = useRouter();

  const yayasanId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // Active Tab: "profil", "langganan", "sekolah", "admin"
  const [activeTab, setActiveTab] = useState("profil");

  // Detail Langganan & Modul & Riwayat Tenant
  const [detailLangganan, setDetailLangganan] = useState(null);
  const [loadingLangganan, setLoadingLangganan] = useState(true);
  const [langgananError, setLanggananError] = useState("");

  // Main state
  const [yayasan, setYayasan] = useState(null);
  const [sekolahList, setSekolahList] = useState([]);
  const [adminList, setAdminList] = useState([]);

  // Unassigned schools available in platform for linking
  const [platformSchools, setPlatformSchools] = useState([]);
  const [selectedSchoolToLink, setSelectedSchoolToLink] = useState("");
  const [linkingSchool, setLinkingSchool] = useState(false);
  const [linkSchoolError, setLinkSchoolError] = useState("");

  // Loading & Global feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dialog & Modal states
  // 1. Delete Yayasan
  const [showDeleteYayasanModal, setShowDeleteYayasanModal] = useState(false);
  const [deletingYayasan, setDeletingYayasan] = useState(false);
  const [deleteYayasanError, setDeleteYayasanError] = useState("");

  // 2. Remove Sekolah from Yayasan
  const [sekolahToRemove, setSekolahToRemove] = useState(null);
  const [removingSekolah, setRemovingSekolah] = useState(false);
  const [removeSekolahError, setRemoveSekolahError] = useState("");

  // 3. Admin Yayasan (Add / Edit / Delete)
  const [adminModalMode, setAdminModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    namaPengguna: "",
    namaLengkap: "",
    email: "",
    kataSandi: "",
    status: "aktif",
  });
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminFormError, setAdminFormError] = useState("");

  // 4. Delete Admin
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(false);
  const [deleteAdminError, setDeleteAdminError] = useState("");

  const notifySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  // Load all detail data
  const loadYayasanData = useCallback(async () => {
    if (!yayasanId) return;

    try {
      setLoading(true);
      setError("");

      // 1. Fetch Yayasan Detail
      const yysRes = await getYayasanById(yayasanId);
      const yysData = yysRes?.data || yysRes;
      setYayasan(yysData);

      // 2. Fetch Sekolah Naungan
      try {
        const schRes = await getSekolahYayasan(yayasanId);
        setSekolahList(Array.isArray(schRes?.data) ? schRes.data : Array.isArray(schRes) ? schRes : []);
      } catch (err) {
        console.warn("Gagal memuat sekolah naungan:", err);
        setSekolahList(yysData?.sekolah || []);
      }

      // 3. Fetch Admin Yayasan
      try {
        const admRes = await getAdminYayasan(yayasanId);
        setAdminList(Array.isArray(admRes?.data) ? admRes.data : Array.isArray(admRes) ? admRes : []);
      } catch (err) {
        console.warn("Gagal memuat admin yayasan:", err);
        setAdminList([]);
      }

      // 4. Fetch platform schools for link selector
      try {
        const pSch = await getPlatformSekolah({ limit: 100 });
        const list = Array.isArray(pSch?.data) ? pSch.data : [];
        // Filter schools not already in this yayasan
        const available = list.filter((s) => s.yayasanId !== yayasanId);
        setPlatformSchools(available);
      } catch (err) {
        console.warn("Gagal memuat daftar sekolah platform:", err);
      }

      // 5. Fetch Detail Langganan, Modul Paket, & Riwayat Tenant
      try {
        setLoadingLangganan(true);
        setLanggananError("");
        const langRes = await getDetailYayasanLangganan(yayasanId);
        const langData = langRes?.data || langRes;
        setDetailLangganan(langData);
      } catch (err) {
        console.warn("Gagal memuat detail langganan:", err);
        setLanggananError(
          err?.response?.data?.message ||
            err?.message ||
            "Gagal memuat detail langganan yayasan."
        );
      } finally {
        setLoadingLangganan(false);
      }
    } catch (err) {
      console.error("Gagal mengambil detail yayasan:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil informasi detail yayasan."
      );
    } finally {
      setLoading(false);
    }
  }, [yayasanId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (active) {
        await loadYayasanData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadYayasanData]);

  // ==========================================
  // ACTION: Delete Yayasan
  // ==========================================
  const handleConfirmDeleteYayasan = async () => {
    try {
      setDeletingYayasan(true);
      setDeleteYayasanError("");

      const res = await deleteYayasan(yayasanId);
      notifySuccess(res?.message || `Yayasan "${yayasan?.nama}" berhasil dinonaktifkan.`);
      setShowDeleteYayasanModal(false);

      setTimeout(() => {
        router.push("/super-admin/yayasan");
      }, 1200);
    } catch (err) {
      console.error("Gagal menghapus yayasan:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menonaktifkan yayasan.";
      setDeleteYayasanError(msg);
    } finally {
      setDeletingYayasan(false);
    }
  };

  // ==========================================
  // ACTION: Hubungkan / Assign Sekolah
  // ==========================================
  const handleAssignSekolah = async () => {
    if (!selectedSchoolToLink) return;

    try {
      setLinkingSchool(true);
      setLinkSchoolError("");

      const res = await updateSekolahYayasan(yayasanId, selectedSchoolToLink);
      notifySuccess(res?.message || "Sekolah berhasil dihubungkan ke yayasan.");
      setSelectedSchoolToLink("");

      // Refresh sekolah list
      await loadYayasanData();
    } catch (err) {
      console.error("Gagal menghubungkan sekolah:", err);
      setLinkSchoolError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menghubungkan sekolah ke yayasan."
      );
    } finally {
      setLinkingSchool(false);
    }
  };

  // ==========================================
  // ACTION: Lepaskan / Remove Sekolah
  // ==========================================
  const handleConfirmRemoveSekolah = async () => {
    if (!sekolahToRemove) return;

    try {
      setRemovingSekolah(true);
      setRemoveSekolahError("");

      const res = await deleteSekolahYayasan(yayasanId, sekolahToRemove.id);
      notifySuccess(res?.message || `Sekolah "${sekolahToRemove.nama}" berhasil dilepaskan dari yayasan.`);
      setSekolahToRemove(null);

      // Refresh sekolah list
      await loadYayasanData();
    } catch (err) {
      console.error("Gagal melepaskan sekolah:", err);
      setRemoveSekolahError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal melepaskan sekolah dari yayasan."
      );
    } finally {
      setRemovingSekolah(false);
    }
  };

  // ==========================================
  // ACTION: Admin Yayasan (Create & Edit)
  // ==========================================
  const openCreateAdminModal = () => {
    setAdminForm({
      namaPengguna: "",
      namaLengkap: "",
      email: "",
      kataSandi: "",
      status: "aktif",
    });
    setSelectedAdmin(null);
    setAdminFormError("");
    setAdminModalMode("create");
  };

  const openEditAdminModal = (admin) => {
    setSelectedAdmin(admin);
    setAdminForm({
      namaPengguna: admin.namaPengguna || "",
      namaLengkap: admin.namaLengkap || "",
      email: admin.email || "",
      kataSandi: "",
      status: admin.status || "aktif",
    });
    setAdminFormError("");
    setAdminModalMode("edit");
  };

  const handleAdminFormSubmit = async (e) => {
    e.preventDefault();
    setAdminFormError("");

    if (!adminForm.namaPengguna.trim() || adminForm.namaPengguna.trim().length < 3) {
      setAdminFormError("Nama pengguna minimal 3 karakter.");
      return;
    }
    if (!adminForm.namaLengkap.trim() || adminForm.namaLengkap.trim().length < 3) {
      setAdminFormError("Nama lengkap minimal 3 karakter.");
      return;
    }
    if (!adminForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email.trim())) {
      setAdminFormError("Alamat email tidak valid.");
      return;
    }

    try {
      setAdminSubmitting(true);

      if (adminModalMode === "create") {
        if (!adminForm.kataSandi || adminForm.kataSandi.length < 8) {
          setAdminFormError("Kata sandi wajib diisi minimal 8 karakter.");
          setAdminSubmitting(false);
          return;
        }

        const payload = {
          namaPengguna: adminForm.namaPengguna.trim(),
          namaLengkap: adminForm.namaLengkap.trim(),
          email: adminForm.email.trim(),
          kataSandi: adminForm.kataSandi,
          status: adminForm.status,
        };

        const res = await createAdminYayasan(yayasanId, payload);
        notifySuccess(res?.message || "Admin yayasan berhasil ditambahkan.");
      } else if (adminModalMode === "edit" && selectedAdmin) {
        const payload = {
          namaPengguna: adminForm.namaPengguna.trim(),
          namaLengkap: adminForm.namaLengkap.trim(),
          email: adminForm.email.trim(),
          status: adminForm.status,
        };

        const res = await updateAdminYayasan(yayasanId, selectedAdmin.id, payload);
        notifySuccess(res?.message || "Data admin yayasan berhasil diperbarui.");
      }

      setAdminModalMode(null);
      await loadYayasanData();
    } catch (err) {
      console.error("Gagal menyimpan data admin:", err);
      setAdminFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menyimpan data admin yayasan."
      );
    } finally {
      setAdminSubmitting(false);
    }
  };

  // ==========================================
  // ACTION: Delete Admin
  // ==========================================
  const handleConfirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      setDeletingAdmin(true);
      setDeleteAdminError("");

      const res = await deleteAdminYayasan(yayasanId, adminToDelete.id);
      notifySuccess(res?.message || `Admin "${adminToDelete.namaLengkap}" berhasil dinonaktifkan.`);
      setAdminToDelete(null);

      // Refresh list
      await loadYayasanData();
    } catch (err) {
      console.error("Gagal menghapus admin yayasan:", err);
      setDeleteAdminError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menonaktifkan admin yayasan."
      );
    } finally {
      setDeletingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page theme-text min-h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
          <p className="text-sm theme-text-muted">Memuat rincian yayasan dari backend...</p>
        </div>
      </div>
    );
  }

  if (error || !yayasan) {
    return (
      <div className="theme-page theme-text min-h-full flex items-center justify-center p-8">
        <div className={`w-full max-w-md rounded-2xl border theme-border theme-card p-6 text-center ${themeCardShadow}`}>
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-lg font-bold theme-text">Yayasan Tidak Ditemukan</h2>
          <p className="mt-1 text-xs theme-text-secondary">{error || "Data yayasan tidak tersedia di server."}</p>
          <Link
            href="/super-admin/yayasan"
            className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-card)] ${themeSmallShadow}`}
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Yayasan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/super-admin/yayasan"
            className="font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            Yayasan
          </Link>
          <span className="text-[var(--color-text-placeholder)]">/</span>
          <span className="font-semibold theme-text truncate max-w-[200px]">{yayasan.nama}</span>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className={`rounded-2xl border p-4 ${themeSuccessSoft} ${themeSuccessBorder} flex items-center gap-3`}>
            <CheckCircle2 size={18} className="text-[var(--color-success)] shrink-0" />
            <p className="text-sm font-semibold theme-text">{successMessage}</p>
          </div>
        )}

        {/* Top Header Card */}
        <section
          className={`relative overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
        >
          <div className="relative p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)] ${themeSmallShadow}`}
                >
                  <Landmark size={26} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                      {yayasan.nama}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        yayasan.status === "aktif"
                          ? `${themeSuccessSoft} ${themeSuccessBorder} text-[var(--color-success)]`
                          : `${themeDangerSoft} ${themeDangerBorder} text-red-500`
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          yayasan.status === "aktif" ? "bg-[var(--color-success)]" : "bg-red-500"
                        }`}
                      />
                      {yayasan.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs theme-text-secondary">
                    <span className="font-mono bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-2 py-0.5 rounded font-semibold">
                      NPYP: {yayasan.npyp || "-"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="theme-text-muted" />
                      Terdaftar: {formatDate(yayasan.dibuatPada)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <School size={13} className="theme-text-muted" />
                      {sekolahList.length} Sekolah Naungan
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users size={13} className="theme-text-muted" />
                      {adminList.length} Admin Yayasan
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Header */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link
                  href={`/super-admin/yayasan/${yayasan.id}/edit`}
                  className={`inline-flex items-center gap-1.5 rounded-xl border theme-border theme-card px-4 py-2.5 text-xs font-semibold theme-text-secondary ${themeSmallShadow} transition-all ${themeNeutralHover}`}
                >
                  <Edit size={14} />
                  <span>Edit Yayasan</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteYayasanModal(true);
                    setDeleteYayasanError("");
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border ${themeDangerBorder} theme-card px-4 py-2.5 text-xs font-semibold text-red-500 ${themeSmallShadow} transition-all hover:bg-red-50 dark:hover:bg-red-950/30`}
                >
                  <Trash2 size={14} />
                  <span>Nonaktifkan Yayasan</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`mt-6 flex items-center gap-2 border-t ${themeDivider} pt-4 flex-wrap`}>
              <button
                type="button"
                onClick={() => setActiveTab("profil")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "profil"
                    ? "bg-[var(--color-primary)] text-[var(--color-card)]"
                    : `theme-text-secondary ${themeNeutralHover}`
                }`}
              >
                <Landmark size={14} />
                <span>Profil & Kontak</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("langganan")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "langganan"
                    ? "bg-[var(--color-primary)] text-[var(--color-card)]"
                    : `theme-text-secondary ${themeNeutralHover}`
                }`}
              >
                <Package size={14} />
                <span>Langganan & Modul</span>
                {detailLangganan?.langganan?.sisaHari !== null && detailLangganan?.langganan?.sisaHari !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeTab === "langganan"
                        ? "bg-white/20"
                        : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
                    }`}
                  >
                    {detailLangganan.langganan.sisaHari} hari
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sekolah")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "sekolah"
                    ? "bg-[var(--color-primary)] text-[var(--color-card)]"
                    : `theme-text-secondary ${themeNeutralHover}`
                }`}
              >
                <School size={14} />
                <span>Sekolah Naungan</span>
                <span className={`rounded-full px-2 py-0.2 text-[10px] ${
                  activeTab === "sekolah" ? "bg-white/20" : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
                }`}>
                  {sekolahList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "admin"
                    ? "bg-[var(--color-primary)] text-[var(--color-card)]"
                    : `theme-text-secondary ${themeNeutralHover}`
                }`}
              >
                <ShieldCheck size={14} />
                <span>Admin Pengelola Yayasan</span>
                <span className={`rounded-full px-2 py-0.2 text-[10px] ${
                  activeTab === "admin" ? "bg-white/20" : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
                }`}>
                  {adminList.length}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* TAB 1: PROFIL & INFORMASI */}
        {activeTab === "profil" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Card 1: Data Kontak & Legalitas */}
              <div className={`rounded-2xl border theme-border theme-card p-5 sm:p-6 ${themeCardShadow}`}>
                <h3 className="text-sm font-bold theme-text mb-4 flex items-center gap-2">
                  <Landmark size={16} className="text-[var(--color-primary)]" />
                  Identitas & Kontak Lembaga
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Nama Yayasan</span>
                    <span className="font-semibold theme-text">{yayasan.nama}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">NPYP Resmi</span>
                    <span className="font-mono font-semibold theme-text">{yayasan.npyp || "-"}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Status Kelembagaan</span>
                    <span className="font-semibold capitalize theme-text">{yayasan.status}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Email Resmi</span>
                    <span className="font-medium theme-text">{yayasan.email || "-"}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Hotline / No. Telepon</span>
                    <span className="font-medium theme-text">{yayasan.telepon || "-"}</span>
                  </div>

                  <div className="py-2">
                    <span className="theme-text-muted block mb-1">Alamat Kantor Yayasan</span>
                    <p className={`p-3 rounded-xl border theme-border ${themeNeutralSurface} font-medium theme-text`}>
                      {yayasan.alamat || "Alamat kantor belum dilengkapi."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Paket Langganan & Info Lisensi */}
              <div className={`rounded-2xl border theme-border theme-card p-5 sm:p-6 ${themeCardShadow}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold theme-text flex items-center gap-2">
                    <Building2 size={16} className="text-[var(--color-info)]" />
                    Paket Langganan & Layanan
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("langganan")}
                    className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    <span>Detail Lengkap</span>
                    <Package size={12} />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Paket Saat Ini</span>
                    <span className="font-bold theme-text">
                      {detailLangganan?.langganan?.paket?.nama || yayasan.paket?.nama || "Tanpa Paket"}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Status Langganan</span>
                    <span className="font-semibold capitalize theme-text">
                      {detailLangganan?.langganan?.statusLangganan || yayasan.statusLangganan || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Mulai Berlaku</span>
                    <span className="font-medium theme-text">
                      {formatDate(detailLangganan?.langganan?.tanggalMulai || yayasan.tanggalMulaiLangganan)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Berlaku Sampai</span>
                    <span className="font-medium theme-text">
                      {formatDate(detailLangganan?.langganan?.tanggalBerakhir || yayasan.tanggalBerakhirLangganan)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Sisa Masa Aktif</span>
                    <span className="font-semibold text-[var(--color-primary)]">
                      {detailLangganan?.langganan?.sisaHari !== null && detailLangganan?.langganan?.sisaHari !== undefined
                        ? `${detailLangganan.langganan.sisaHari} Hari`
                        : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b theme-border">
                    <span className="theme-text-muted">Terakhir Diperbarui</span>
                    <span className="font-medium theme-text">{formatDate(yayasan.diperbaruiPada)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAIL LANGGANAN, MODUL PAKET, & RIWAYAT TENANT */}
        {activeTab === "langganan" && (
          <div className="space-y-6">
            {loadingLangganan ? (
              <div className={`rounded-2xl border theme-border theme-card p-12 text-center ${themeCardShadow}`}>
                <Loader2 size={32} className="mx-auto animate-spin text-[var(--color-primary)] mb-3" />
                <p className="text-sm font-medium theme-text">Memuat detail langganan dan modul paket...</p>
              </div>
            ) : langgananError ? (
              <div className={`rounded-2xl border ${themeDangerBorder} ${themeDangerSoft} p-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-[var(--color-danger,_#ef4444)] shrink-0" />
                  <p className="text-sm font-medium text-[var(--color-danger,_#ef4444)]">{langgananError}</p>
                </div>
                <button
                  type="button"
                  onClick={loadYayasanData}
                  className="rounded-xl border theme-border px-3 py-1.5 text-xs font-semibold theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>Coba Lagi</span>
                </button>
              </div>
            ) : (
              <>
                {/* 1. Detail Paket & Masa Aktif */}
                <div className={`rounded-2xl border theme-border theme-card p-5 sm:p-6 ${themeCardShadow}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b theme-border pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package size={18} className="text-[var(--color-primary)]" />
                        <h3 className="text-sm font-bold theme-text">
                          {detailLangganan?.langganan?.paket?.nama || "Paket Tidak Terikat"}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            detailLangganan?.langganan?.statusLangganan === "active"
                              ? `${themeSuccessSoft} text-[var(--color-success)] ${themeSuccessBorder} border`
                              : `${themeWarningSoft} text-[var(--color-warning)] ${themeWarningBorder} border`
                          }`}
                        >
                          {detailLangganan?.langganan?.statusLangganan || "Nonaktif"}
                        </span>
                      </div>
                      <p className="text-xs theme-text-muted mt-1">
                        {detailLangganan?.langganan?.paket?.deskripsi || "Tidak ada deskripsi paket untuk yayasan ini."}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium theme-text-muted">
                      <div>
                        <span>Harga Paket:</span>{" "}
                        <span className="font-bold theme-text">
                          {formatRupiah(detailLangganan?.langganan?.paket?.harga)}
                        </span>
                      </div>
                      <div>
                        <span>Durasi:</span>{" "}
                        <span className="font-bold theme-text">
                          {detailLangganan?.langganan?.paket?.durasi ? `${detailLangganan.langganan.paket.durasi} Hari` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border theme-border ${themeNeutralSurface}`}>
                      <div className="flex items-center gap-2 text-xs theme-text-muted mb-1">
                        <Calendar size={14} />
                        <span>Mulai Berlangganan</span>
                      </div>
                      <p className="text-sm font-bold theme-text">
                        {formatDate(detailLangganan?.langganan?.tanggalMulai)}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border theme-border ${themeNeutralSurface}`}>
                      <div className="flex items-center gap-2 text-xs theme-text-muted mb-1">
                        <Calendar size={14} />
                        <span>Berakhir Pada</span>
                      </div>
                      <p className="text-sm font-bold theme-text">
                        {formatDate(detailLangganan?.langganan?.tanggalBerakhir)}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border theme-border ${themeNeutralSurface}`}>
                      <div className="flex items-center gap-2 text-xs theme-text-muted mb-1">
                        <Clock size={14} />
                        <span>Sisa Masa Aktif</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--color-primary)]">
                        {detailLangganan?.langganan?.sisaHari !== null && detailLangganan?.langganan?.sisaHari !== undefined
                          ? `${detailLangganan.langganan.sisaHari} Hari Kalender`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Modul Termasuk dalam Paket */}
                <div className={`rounded-2xl border theme-border theme-card p-5 sm:p-6 ${themeCardShadow}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold theme-text flex items-center gap-2">
                      <Layers size={16} className="text-[var(--color-primary)]" />
                      Modul Fitur yang Diaktifkan
                    </h3>
                    <span className="text-xs theme-text-muted">
                      {detailLangganan?.langganan?.paket?.modul?.length || 0} Modul Tersedia
                    </span>
                  </div>

                  {Array.isArray(detailLangganan?.langganan?.paket?.modul) &&
                  detailLangganan.langganan.paket.modul.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {detailLangganan.langganan.paket.modul.map((mod, idx) => (
                        <div
                          key={mod.kode || idx}
                          className={`p-3.5 rounded-xl border theme-border ${themeNeutralSurface} flex items-center justify-between`}
                        >
                          <div>
                            <p className="text-xs font-bold theme-text">{mod.nama || mod.kode}</p>
                            <p className="text-[10px] font-mono theme-text-muted">kode: {mod.kode}</p>
                          </div>
                          <CheckCircle2 size={16} className="text-[var(--color-success)] shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-6 rounded-xl border border-dashed theme-border text-center ${themeNeutralSurface}`}>
                      <Layers size={24} className="mx-auto text-[var(--color-text-muted)] mb-2" />
                      <p className="text-xs font-semibold theme-text">Tidak ada modul khusus terpasang</p>
                      <p className="text-[11px] theme-text-muted mt-0.5">
                        Paket yayasan ini belum dikonfigurasikan dengan modul paket individual.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Riwayat Pendaftaran Tenant */}
                <div className={`rounded-2xl border theme-border theme-card p-5 sm:p-6 ${themeCardShadow}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold theme-text flex items-center gap-2">
                      <Receipt size={16} className="text-[var(--color-primary)]" />
                      Riwayat Pendaftaran Tenant
                    </h3>
                    <span className="text-xs theme-text-muted">
                      {detailLangganan?.riwayatPendaftaran?.length || 0} Catatan Pendaftaran
                    </span>
                  </div>

                  {Array.isArray(detailLangganan?.riwayatPendaftaran) &&
                  detailLangganan.riwayatPendaftaran.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border theme-border">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className={`border-b theme-border ${themeNeutralSurface} font-semibold theme-text`}>
                            <th className="p-3">ID Registrasi / Order ID</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Tanggal Dibuat</th>
                            <th className="p-3">Tanggal Dikonversi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y theme-border">
                          {detailLangganan.riwayatPendaftaran.map((reg) => (
                            <tr key={reg.id} className={`${themeNeutralHover} transition-colors`}>
                              <td className="p-3 font-mono theme-text">
                                {reg.midtransOrderId || reg.id}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    reg.status === "selesai" || reg.status === "aktif"
                                      ? `${themeSuccessSoft} text-[var(--color-success)]`
                                      : `${themeNeutralSurface} theme-text-muted`
                                  }`}
                                >
                                  {reg.status || "-"}
                                </span>
                              </td>
                              <td className="p-3 theme-text-muted">{formatDate(reg.dibuatPada)}</td>
                              <td className="p-3 theme-text-muted">{formatDate(reg.dikonversiPada)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`p-6 rounded-xl border border-dashed theme-border text-center ${themeNeutralSurface}`}>
                      <Receipt size={24} className="mx-auto text-[var(--color-text-muted)] mb-2" />
                      <p className="text-xs font-semibold theme-text">Belum ada riwayat pendaftaran tenant</p>
                      <p className="text-[11px] theme-text-muted mt-0.5">
                        Yayasan ini dibuat secara manual oleh Super Administrator atau belum memiliki catatan registrasi via form pendaftaran tenant.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: SEKOLAH DALAM NAUNGAN */}
        {activeTab === "sekolah" && (
          <div className="space-y-6">
            {/* Link School Form */}
            <div className={`rounded-2xl border theme-border theme-card p-5 ${themeCardShadow}`}>
              <h3 className="text-sm font-bold theme-text mb-2 flex items-center gap-2">
                <Link2 size={16} className="text-[var(--color-primary)]" />
                Hubungkan Sekolah ke Yayasan
              </h3>
              <p className="text-xs theme-text-secondary mb-4">
                Tetapkan sekolah yang terdaftar di platform SmartSchool agar berada di bawah naungan yayasan ini.
              </p>

              {linkSchoolError && (
                <div className={`mb-4 rounded-xl border p-3 text-xs text-red-600 dark:text-red-400 ${themeDangerSoft} ${themeDangerBorder}`}>
                  <strong>Gagal:</strong> {linkSchoolError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex-1">
                  <select
                    value={selectedSchoolToLink}
                    onChange={(e) => setSelectedSchoolToLink(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">-- Pilih Sekolah untuk Dihubungkan --</option>
                    {platformSchools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} (NPSN: {s.npsn || "-"}) {s.yayasan ? `[Saat ini: ${s.yayasan.nama}]` : "[Mandiri]"}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={!selectedSchoolToLink || linkingSchool}
                  onClick={handleAssignSekolah}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themeSmallShadow} transition-all hover:opacity-90 disabled:opacity-50`}
                >
                  {linkingSchool ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Menghubungkan...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Hubungkan ke Yayasan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List Sekolah Naungan */}
            <div className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}>
              <div className={`border-b ${themeDivider} px-5 py-4 flex items-center justify-between`}>
                <div>
                  <h3 className="text-sm font-bold theme-text">Daftar Sekolah Naungan</h3>
                  <p className="text-xs theme-text-muted mt-0.5">
                    Sumber data: <span className="font-mono">GET /api/yayasan/:yayasanId/sekolah</span>
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border theme-border theme-text-secondary">
                  {sekolahList.length} Unit Sekolah
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${themeDivider} ${themeNeutralSurface}`}>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        No
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Nama Sekolah & NPSN
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Paket Langganan
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${themeDivider}`}>
                    {sekolahList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center">
                          <School size={28} className="mx-auto theme-text-muted opacity-40 mb-2" />
                          <p className="text-sm font-medium theme-text">Belum ada sekolah naungan</p>
                          <p className="text-xs theme-text-muted mt-0.5">
                            Gunakan dropdown di atas untuk menghubungkan sekolah ke yayasan ini.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      sekolahList.map((sch, idx) => {
                        const paketInfo = sch.langgananSekolah?.[0]?.paket?.nama || "Tanpa Paket";
                        return (
                          <tr key={sch.id} className={`transition-colors ${themeNeutralHover}`}>
                            <td className="px-5 py-4 text-xs theme-text-muted">{(idx + 1).toString().padStart(2, "0")}</td>
                            <td className="px-5 py-4">
                              <p className="font-semibold theme-text">{sch.nama}</p>
                              <p className="text-[11px] font-mono theme-text-muted">NPSN: {sch.npsn || "-"}</p>
                            </td>
                            <td className="px-5 py-4 text-xs font-medium theme-text">
                              {paketInfo}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                  sch.status === "aktif"
                                    ? `${themeSuccessSoft} ${themeSuccessBorder} text-[var(--color-success)]`
                                    : `${themeDangerSoft} ${themeDangerBorder} text-red-500`
                                }`}
                              >
                                {sch.status === "aktif" ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSekolahToRemove(sch);
                                  setRemoveSekolahError("");
                                }}
                                title="Keluarkan dari naungan yayasan"
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              >
                                <Unlink size={13} />
                                <span>Lepaskan</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN YAYASAN */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            {/* Header Admin Yayasan */}
            <div className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}>
              <div className={`border-b ${themeDivider} px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
                <div>
                  <h3 className="text-sm font-bold theme-text">Akun Pengelola Yayasan (Admin)</h3>
                  <p className="text-xs theme-text-muted mt-0.5">
                    Sumber data: <span className="font-mono">GET /api/yayasan/:yayasanId/admin</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateAdminModal}
                  className={`inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-card)] ${themeSmallShadow} transition-all hover:opacity-90`}
                >
                  <UserPlus size={15} />
                  <span>Tambah Admin Yayasan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${themeDivider} ${themeNeutralSurface}`}>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        No
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Nama Lengkap & Username
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Email
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Terakhir Login
                      </th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${themeDivider}`}>
                    {adminList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center">
                          <Users size={28} className="mx-auto theme-text-muted opacity-40 mb-2" />
                          <p className="text-sm font-medium theme-text">Belum ada akun admin yayasan</p>
                          <p className="text-xs theme-text-muted mt-0.5">
                            Klik &quot;Tambah Admin Yayasan&quot; untuk membuat kredensial baru.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      adminList.map((adm, idx) => (
                        <tr key={adm.id} className={`transition-colors ${themeNeutralHover}`}>
                          <td className="px-5 py-4 text-xs theme-text-muted">{(idx + 1).toString().padStart(2, "0")}</td>
                          <td className="px-5 py-4">
                            <p className="font-semibold theme-text">{adm.namaLengkap}</p>
                            <p className="text-[11px] font-mono theme-text-muted">@{adm.namaPengguna}</p>
                          </td>
                          <td className="px-5 py-4 text-xs theme-text">{adm.email}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                adm.status === "aktif"
                                  ? `${themeSuccessSoft} ${themeSuccessBorder} text-[var(--color-success)]`
                                  : `${themeDangerSoft} ${themeDangerBorder} text-red-500`
                              }`}
                            >
                              {adm.status === "aktif" ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs theme-text-muted">
                            {formatDate(adm.terakhirLogin)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditAdminModal(adm)}
                                title="Edit data admin"
                                className="p-1.5 rounded-lg theme-text-muted hover:text-[var(--color-primary)] transition-colors"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminToDelete(adm);
                                  setDeleteAdminError("");
                                }}
                                title="Hapus / Cabut akses admin"
                                className="p-1.5 rounded-lg theme-text-muted hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Delete Yayasan Confirmation */}
      {showDeleteYayasanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border theme-border theme-card p-6 ${themeCardShadow}`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themeDangerSoft} text-red-500`}>
                <AlertTriangle size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold theme-text">Nonaktifkan Yayasan?</h3>
                <p className="mt-1 text-xs theme-text-secondary">
                  Anda akan menonaktifkan yayasan <strong className="theme-text">{yayasan.nama}</strong>.
                </p>
                <p className="mt-2 text-[11px] theme-text-muted">
                  Perhatian: Backend mewajibkan semua sekolah naungan dilepaskan terlebih dahulu sebelum yayasan dapat dinonaktifkan.
                </p>
              </div>
            </div>

            {deleteYayasanError && (
              <div className={`mt-4 rounded-xl border p-3 text-xs text-red-600 dark:text-red-400 ${themeDangerSoft} ${themeDangerBorder}`}>
                <strong>Gagal:</strong> {deleteYayasanError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deletingYayasan}
                onClick={() => {
                  setShowDeleteYayasanModal(false);
                  setDeleteYayasanError("");
                }}
                className={`rounded-xl border theme-border theme-card px-4 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover} disabled:opacity-50`}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deletingYayasan}
                onClick={handleConfirmDeleteYayasan}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {deletingYayasan ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Ya, Nonaktifkan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Remove Sekolah Confirmation */}
      {sekolahToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border theme-border theme-card p-6 ${themeCardShadow}`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themeDangerSoft} text-red-500`}>
                <Unlink size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold theme-text">Lepaskan Sekolah dari Yayasan?</h3>
                <p className="mt-1 text-xs theme-text-secondary">
                  Sekolah <strong className="theme-text">{sekolahToRemove.nama}</strong> akan dilepaskan dari naungan yayasan ini.
                </p>
                <p className="mt-2 text-[11px] theme-text-muted">
                  Endpoint: <span className="font-mono">DELETE /api/yayasan/:yayasanId/sekolah/:sekolahId</span>
                </p>
              </div>
            </div>

            {removeSekolahError && (
              <div className={`mt-4 rounded-xl border p-3 text-xs text-red-600 dark:text-red-400 ${themeDangerSoft} ${themeDangerBorder}`}>
                <strong>Gagal:</strong> {removeSekolahError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={removingSekolah}
                onClick={() => {
                  setSekolahToRemove(null);
                  setRemoveSekolahError("");
                }}
                className={`rounded-xl border theme-border theme-card px-4 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover} disabled:opacity-50`}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={removingSekolah}
                onClick={handleConfirmRemoveSekolah}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {removingSekolah ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Melepaskan...
                  </>
                ) : (
                  <>
                    <Unlink size={14} />
                    Lepaskan Sekolah
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Admin Yayasan Form (Create / Edit) */}
      {adminModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl border theme-border theme-card p-6 ${themeCardShadow}`}>
            <h3 className="text-base font-bold theme-text mb-1">
              {adminModalMode === "create" ? "Tambah Admin Pengelola Yayasan" : "Edit Data Admin Yayasan"}
            </h3>
            <p className="text-xs theme-text-secondary mb-4">
              {adminModalMode === "create"
                ? "Daftarkan akun admin baru untuk mengelola yayasan ini."
                : `Perbarui profil admin @${selectedAdmin?.namaPengguna}.`}
            </p>

            {adminFormError && (
              <div className={`mb-4 rounded-xl border p-3 text-xs text-red-600 dark:text-red-400 ${themeDangerSoft} ${themeDangerBorder}`}>
                <strong>Gagal:</strong> {adminFormError}
              </div>
            )}

            <form onSubmit={handleAdminFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">
                  Nama Pengguna (Username) <span className="text-[var(--color-primary)]">*</span>
                </label>
                <input
                  type="text"
                  value={adminForm.namaPengguna}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, namaPengguna: e.target.value }))}
                  placeholder="admin_yayasan_01"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">
                  Nama Lengkap <span className="text-[var(--color-primary)]">*</span>
                </label>
                <input
                  type="text"
                  value={adminForm.namaLengkap}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, namaLengkap: e.target.value }))}
                  placeholder="Budi Santoso, M.Pd."
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">
                  Alamat Email <span className="text-[var(--color-primary)]">*</span>
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@yayasan.sch.id"
                  className={inputClass}
                  required
                />
              </div>

              {adminModalMode === "create" && (
                <div>
                  <label className="block text-xs font-semibold theme-text-secondary mb-1">
                    Kata Sandi Awal <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    type="password"
                    value={adminForm.kataSandi}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, kataSandi: e.target.value }))}
                    placeholder="Minimal 8 karakter"
                    className={inputClass}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">Status Akun</label>
                <select
                  value={adminForm.status}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, status: e.target.value }))}
                  className={selectClass}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t theme-border">
                <button
                  type="button"
                  disabled={adminSubmitting}
                  onClick={() => setAdminModalMode(null)}
                  className={`rounded-xl border theme-border theme-card px-4 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover} disabled:opacity-50`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adminSubmitting}
                  className={`inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-5 py-2 text-xs font-semibold text-[var(--color-card)] ${themeSmallShadow} transition-all hover:opacity-90 disabled:opacity-60`}
                >
                  {adminSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Simpan Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Admin Confirmation */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border theme-border theme-card p-6 ${themeCardShadow}`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themeDangerSoft} text-red-500`}>
                <Trash2 size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold theme-text">Cabut Akses Admin?</h3>
                <p className="mt-1 text-xs theme-text-secondary">
                  Anda akan menonaktifkan akun admin <strong className="theme-text">{adminToDelete.namaLengkap}</strong> (@{adminToDelete.namaPengguna}).
                </p>
                <p className="mt-2 text-[11px] theme-text-muted">
                  Perhatian: Backend menolak jika admin ini adalah satu-satunya admin aktif pada yayasan.
                </p>
              </div>
            </div>

            {deleteAdminError && (
              <div className={`mt-4 rounded-xl border p-3 text-xs text-red-600 dark:text-red-400 ${themeDangerSoft} ${themeDangerBorder}`}>
                <strong>Gagal:</strong> {deleteAdminError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deletingAdmin}
                onClick={() => {
                  setAdminToDelete(null);
                  setDeleteAdminError("");
                }}
                className={`rounded-xl border theme-border theme-card px-4 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover} disabled:opacity-50`}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deletingAdmin}
                onClick={handleConfirmDeleteAdmin}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {deletingAdmin ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Ya, Cabut Akses
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
