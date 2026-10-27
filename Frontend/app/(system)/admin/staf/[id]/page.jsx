"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  deleteUser,
  getUserById,
} from "@/services/user.service";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Edit,
  Trash2,
  School,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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

export default function DetailStafPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staf, setStaf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadStaf = useCallback(async () => {
    if (!id) {
      setError("ID staf tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getUserById(String(id));
      const data = response?.data ?? response;

      if (!data?.id) {
        throw new Error("Data staf tidak ditemukan.");
      }

      setStaf(data);
    } catch (err) {
      console.error(
        "[DetailStafPage] Gagal mengambil data staf:",
        err
      );
      setStaf(null);
      setError(err?.message || "Gagal memuat data staf.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStaf();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStaf]);

  const goBack = () => {
    router.push("/admin/staf");
  };

  const handleDelete = async () => {
    if (!staf?.id || deleting) return;

    const namaStaf =
      staf.namaLengkap || staf.namaPengguna || "staf ini";

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus ${namaStaf}?`
    );

    if (!confirmed) return;

    setDeleting(true);
    setActionError("");

    try {
      await deleteUser(String(staf.id));
      router.push("/admin/staf");
    } catch (err) {
      console.error(
        "[DetailStafPage] Gagal menghapus staf:",
        err
      );
      setActionError(
        err?.message || "Gagal menghapus staf."
      );
      setDeleting(false);
    }
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "aktif" || normalized === "active") {
      return {
        label: "Aktif",
        bg: themeSuccessSurface,
        text: "text-[var(--color-success)]",
        border: themeSuccessBorder,
        dot: "bg-[var(--color-success)]",
        icon: CheckCircle,
      };
    }

    return {
      label:
        normalized === "nonaktif" ||
        normalized === "inactive"
          ? "Nonaktif"
          : status || "Nonaktif",
      bg: themeNeutralSurface,
      text: "theme-text-secondary",
      border: themeNeutralBorder,
      dot: "bg-[var(--color-text-muted)]",
      icon: XCircle,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-page flex">
        <Sidebar
          active="staf"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <Loader2
                size={30}
                className={`${themePrimaryText} animate-spin mx-auto mb-3`}
              />

              <p className="text-sm theme-text-muted">
                Memuat data staf...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !staf) {
    return (
      <div className="min-h-screen theme-page flex">
        <Sidebar
          active="staf"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div
                className={`w-12 h-12 mx-auto mb-4 rounded-full ${themeDangerSurface} flex items-center justify-center`}
              >
                <AlertCircle
                  size={24}
                  className="theme-danger"
                />
              </div>

              <h2 className="text-base font-semibold theme-text">
                Data tidak ditemukan
              </h2>

              <p className="text-sm theme-text-muted mt-1 mb-5">
                {error || "Data staf yang Anda cari tidak tersedia."}
              </p>

              <button
                onClick={goBack}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-medium hover:opacity-90 transition`}
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar Staf
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(staf.status);
  const StatusIcon = statusStyle.icon;

  const namaStaf =
    staf.namaLengkap || staf.namaPengguna || "-";

  const roleName =
    staf.peran?.namaTampilan ||
    staf.peran?.nama ||
    "-";

  const jenisKelamin =
    staf.jenisKelamin === "L"
      ? "Laki-laki"
      : staf.jenisKelamin === "P"
        ? "Perempuan"
        : staf.jenisKelamin || "-";

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar
        active="staf"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 min-w-0">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">

            <div className="mb-6">
              <button
                onClick={goBack}
                className={`inline-flex items-center gap-2 text-sm theme-text-secondary hover:text-[var(--color-primary)] transition mb-4`}
              >
                <ArrowLeft size={17} />
                Kembali ke Daftar Staf
              </button>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${themePrimaryGradient} flex items-center justify-center shrink-0`}
                    >
                      <User
                        size={20}
                        className="text-[var(--color-card)]"
                      />
                    </div>

                    <div>
                      <h1 className="text-xl sm:text-2xl font-semibold theme-text">
                        Detail Staf
                      </h1>

                      <p className="text-sm theme-text-secondary mt-0.5">
                        Informasi lengkap staf yang terdaftar di SmartSchool.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {actionError && (
              <div
                className={`mb-5 flex items-start gap-2.5 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-3.5 text-sm`}
              >
                <AlertCircle
                  size={16}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <p className="theme-danger leading-relaxed">
                  {actionError}
                </p>
              </div>
            )}

            <section
              className={`theme-card border ${themeNeutralBorder} rounded-xl ${themeCardShadow} overflow-hidden`}
            >

              <div
                className={`px-5 sm:px-6 lg:px-7 py-6 border-b ${themeDivider}`}
              >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                  <div className="flex items-center gap-4 min-w-0">

                    <div
                      className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full ${themePrimarySoft} ${themePrimarySoftBorder} border flex items-center justify-center shrink-0`}
                    >
                      <User
                        size={28}
                        className={themePrimaryText}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold theme-text break-words">
                        {namaStaf}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 mt-2">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${themeNeutralSurface} border ${themeNeutralBorder} text-xs font-medium theme-text-secondary`}
                        >
                          <Briefcase size={13} />
                          {roleName}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          />

                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/staf/edit/${staf.id}`
                        )
                      }
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border ${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)] text-sm font-medium hover:opacity-80 transition`}
                    >
                      <Edit size={16} />
                      Edit
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border ${themeDangerBorder} ${themeDangerSurface} theme-danger text-sm font-medium hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {deleting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {deleting ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-7">

                <div className="mb-4">
                  <h3 className="text-sm font-semibold theme-text">
                    Informasi Kontak & Unit
                  </h3>

                  <p className="text-xs theme-text-muted mt-1">
                    Informasi dasar mengenai staf.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                  <InfoCard
                    icon={Mail}
                    label="Email"
                    value={staf.email || "-"}
                  />

                  <InfoCard
                    icon={Phone}
                    label="Telepon"
                    value={staf.noTelepon || "-"}
                  />

                  <InfoCard
                    icon={MapPin}
                    label="Alamat"
                    value={
                      staf.alamat ||
                      staf.alamatDomisili ||
                      "-"
                    }
                  />

                  <InfoCard
                    icon={School}
                    label="Sekolah"
                    value={staf.sekolah?.nama || "-"}
                  />
                </div>

                <div className={`mt-7 pt-6 border-t ${themeDivider}`}>

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold theme-text">
                      Data Personal
                    </h3>

                    <p className="text-xs theme-text-muted mt-1">
                      Informasi identitas dan kepegawaian.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    <DetailItem
                      icon={Calendar}
                      label="Tanggal Bergabung"
                      value={formatDate(staf.dibuatPada)}
                    />

                    <DetailItem
                      icon={User}
                      label="Jenis Kelamin"
                      value={jenisKelamin}
                    />

                    <DetailItem
                      icon={Building}
                      label="NIP"
                      value={staf.nip || "-"}
                      mono
                    />

                    <DetailItem
                      icon={Building}
                      label="NUPTK"
                      value={staf.nuptk || "-"}
                      mono
                    />

                    <DetailItem
                      icon={MapPin}
                      label="Tempat Lahir"
                      value={staf.tempatLahir || "-"}
                    />

                    <DetailItem
                      icon={Calendar}
                      label="Tanggal Lahir"
                      value={formatDate(staf.tanggalLahir)}
                    />
                  </div>
                </div>

                <div
                  className={`mt-7 pt-5 border-t ${themeDivider} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
                >

                  <div className="flex items-center gap-2">
                    <StatusIcon
                      size={17}
                      className={statusStyle.text}
                    />

                    <span className="text-sm theme-text-secondary">
                      Status staf:
                    </span>

                    <span
                      className={`text-sm font-semibold ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  <button
                    onClick={goBack}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${themeNeutralBorder} theme-card text-sm font-medium theme-text-secondary ${themeNeutralHover} transition`}
                  >
                    <ArrowLeft size={16} />
                    Kembali
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div
      className={`min-w-0 p-4 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} ${themeNeutralHover} transition`}
    >
      <div className="flex items-start gap-3">

        <div
          className={`w-8 h-8 rounded-md theme-card border ${themeNeutralBorder} flex items-center justify-center shrink-0`}
        >
          <Icon
            size={16}
            className="theme-text-muted"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs theme-text-muted mb-1">
            {label}
          </p>

          <p className="text-sm font-medium theme-text break-words leading-relaxed">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">

      <div
        className={`w-8 h-8 rounded-md ${themeNeutralSurface} flex items-center justify-center shrink-0`}
      >
        <Icon
          size={15}
          className="theme-text-muted"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs theme-text-muted mb-1">
          {label}
        </p>

        <p
          className={`text-sm font-medium theme-text break-words ${
            mono ? "font-mono text-xs sm:text-sm" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}