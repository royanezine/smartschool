"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/services/user.service";
import {
  getReviewSaya,
  createReviewSaya,
  updateReviewSaya,
} from "@/services/review.service";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Building2,
  FileText,
  Settings,
  Edit,
  Camera,
  Shield,
  Activity,
  CheckCircle,
  LogOut,
  School,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  UserCircle,
  BadgeCheck,
  ChevronRight,
  MessageSquare,
  Send,
  Star,
} from "lucide-react";

const MAX_KOMENTAR = 500;

const STATUS_REVIEW = {
  menunggu: {
    label: "Menunggu Moderasi",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    description:
      "Review kamu sudah tersimpan dan sedang menunggu pemeriksaan Super Admin.",
  },
  tampil: {
    label: "Ditampilkan",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    description:
      "Review kamu sudah disetujui dan dapat ditampilkan kepada pengunjung.",
  },
  disembunyikan: {
    label: "Disembunyikan",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    description:
      "Review kamu sedang disembunyikan. Jika diedit, review akan kembali menunggu moderasi.",
  },
};



function formatDate(value, withTime = false) {
  if (!value) return "Belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum tersedia";

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Belum tersedia";
  }
  return String(value);
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "—";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeProfile(response) {
  const user = response?.data;
  if (!response?.success || !user || !user.id) {
    throw new Error(response?.message || "Data profil tidak ditemukan.");
  }
  return user;
}

function extractReview(response) {
  if (response && Object.prototype.hasOwnProperty.call(response, "data")) {
    return response.data;
  }
  return response ?? null;
}

function getErrorMessage(error) {
  return error?.message || "Terjadi kesalahan. Silakan coba lagi.";
}



function InfoRow({ icon: Icon, label, value, isFullWidth = false }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${isFullWidth ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 theme-text-muted">
        <Icon size={14} className="shrink-0" />
        <p className="text-[11px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="theme-text break-words text-sm font-semibold">{displayValue(value)}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="mb-5 flex items-center justify-between border-b theme-border pb-3">
      <div className="flex items-center gap-2">
        <Icon size={18} className="theme-primary-text" />
        <h2 className="theme-text text-sm font-bold uppercase tracking-wide">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ProfileLoading() {
  return (
    <div className="theme-page flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle size={32} className="animate-spin theme-primary-text" />
        <p className="theme-text-secondary text-sm font-medium">Memuat data profil...</p>
      </div>
    </div>
  );
}



function ReviewSection() {
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [loadingReview, setLoadingReview] = useState(true);
  const [savingReview, setSavingReview] = useState(false);
  const [errorReview, setErrorReview] = useState("");
  const [successReview, setSuccessReview] = useState("");

  const loadReview = useCallback(async () => {
    setLoadingReview(true);
    setErrorReview("");
    try {
      const response = await getReviewSaya();
      const data = extractReview(response);
      setReview(data);
      if (data) {
        setRating(Number(data.rating) || 0);
        setKomentar(data.komentar || "");
      } else {
        setRating(0);
        setKomentar("");
      }
    } catch (error) {
      setErrorReview(getErrorMessage(error));
    } finally {
      setLoadingReview(false);
    }
  }, []);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setErrorReview("");
    setSuccessReview("");

    const komentarBersih = komentar.trim();
    if (!rating || rating < 1 || rating > 5) return setErrorReview("Pilih rating antara 1 sampai 5 bintang.");
    if (!komentarBersih) return setErrorReview("Komentar wajib diisi.");
    if (komentarBersih.length > MAX_KOMENTAR) return setErrorReview(`Komentar maksimal ${MAX_KOMENTAR} karakter.`);

    setSavingReview(true);
    try {
      const payload = { rating, komentar: komentarBersih };
      const response = review ? await updateReviewSaya(payload) : await createReviewSaya(payload);
      const savedReview = extractReview(response);

      if (savedReview) {
        setReview(savedReview);
        setRating(Number(savedReview.rating) || rating);
        setKomentar(savedReview.komentar || komentarBersih);
      } else {
        await loadReview();
      }

      setSuccessReview(review ? "Review berhasil diperbarui dan kembali menunggu moderasi." : "Review berhasil dikirim dan menunggu moderasi.");
    } catch (error) {
      const message = getErrorMessage(error);
      if (!review && (message.includes("409") || message.toLowerCase().includes("sudah ada"))) {
        setErrorReview("Review untuk akun ini sudah ada. Muat ulang data.");
      } else {
        setErrorReview(message);
      }
    } finally {
      setSavingReview(false);
    }
  };

  const statusInfo = review ? STATUS_REVIEW[review.status] || STATUS_REVIEW.menunggu : null;
  const currentRating = Math.max(0, Math.min(5, Number(review?.rating) || 0));

  return (
    <section className="theme-card theme-border rounded-xl border p-5 shadow-sm sm:p-6">
      <SectionHeader 
        icon={MessageSquare} 
        title="Review SmartSchool" 
        action={
          <button type="button" onClick={loadReview} disabled={loadingReview || savingReview} className="theme-text-secondary flex items-center gap-1.5 text-xs hover:text-[var(--color-primary)] disabled:opacity-50">
            <RefreshCw size={14} className={loadingReview ? "animate-spin" : ""} /> Muat Ulang
          </button>
        }
      />

      <div className="space-y-5">
        {errorReview && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="flex-1">{errorReview}</p>
            <button type="button" onClick={() => setErrorReview("")} className="font-semibold">×</button>
          </div>
        )}

        {successReview && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <p className="flex-1">{successReview}</p>
            <button type="button" onClick={() => setSuccessReview("")} className="font-semibold">×</button>
          </div>
        )}

        {loadingReview ? (
          <div className="flex min-h-24 items-center justify-center gap-2 text-sm theme-text-muted">
            <LoaderCircle size={18} className="animate-spin" /> Memuat data review...
          </div>
        ) : (
          <>
            {review && statusInfo && (
              <div className="rounded-lg bg-slate-50 border theme-border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="theme-text-secondary text-xs leading-relaxed">{statusInfo.description}</p>
                  <span className={`inline-flex w-fit shrink-0 items-center rounded border px-2 py-0.5 text-xs font-semibold ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="mt-3 flex gap-4 text-[11px] theme-text-muted border-t theme-border pt-3">
                  <p>Dikirim: <span className="font-medium theme-text">{formatDate(review.dibuatPada)}</span></p>
                  <p>Diperbarui: <span className="font-medium theme-text">{formatDate(review.diperbaruiPada)}</span></p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <fieldset disabled={savingReview}>
                <legend className="theme-text text-sm font-semibold mb-2">Rating <span className="text-red-500">*</span></legend>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onMouseEnter={() => setHoverRating(value)}
                      onClick={() => setRating(value)}
                      className={`rounded p-0.5 text-2xl transition ${(hoverRating || rating) >= value ? "text-amber-400" : "theme-text-muted hover:text-amber-300"}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="theme-text-secondary ml-2 text-xs font-medium">
                    {rating > 0 ? `${rating}/5` : "Belum ada"}
                  </span>
                </div>
              </fieldset>

              <div>
                <label className="theme-text block text-sm font-semibold mb-2">Komentar <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  maxLength={MAX_KOMENTAR}
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  placeholder="Bagikan pengalaman kamu..."
                  disabled={savingReview}
                  className="theme-input w-full resize-none rounded-lg border theme-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-right text-[10px] theme-text-muted mt-1">{komentar.length}/{MAX_KOMENTAR}</p>
              </div>

              <button type="submit" disabled={savingReview || !rating || !komentar.trim()} className="theme-primary inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {savingReview ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                {review ? "Simpan Perubahan" : "Kirim Review"}
              </button>
            </form>

            {review && (
              <div className="rounded-lg border theme-border p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={15} className="text-amber-400" />
                  <h3 className="theme-text text-xs font-bold uppercase tracking-wider">Review Saat Ini</h3>
                </div>
                <div className="text-sm tracking-widest text-amber-400">
                  {"★".repeat(currentRating)}<span className="theme-text-muted">{"★".repeat(5 - currentRating)}</span>
                </div>
                <p className="theme-text mt-2 whitespace-pre-wrap text-xs leading-relaxed">{review.komentar || "-"}</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}



export default function AdminProfilePage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await getProfile();
      setProfile(normalizeProfile(response));
    } catch (err) {
      setError(err?.message || "Gagal mengambil data profil.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProfile(), 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  const handleLogout = () => {
    if (!window.confirm("Yakin ingin logout?")) return;
    import("@/lib/auth")
      .then(({ clearSession }) => {
        clearSession();
        router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  };

  if (loading) return <ProfileLoading />;

  const nama = profile?.namaLengkap || profile?.namaPengguna || "Pengguna";
  const peran = profile?.peran;
  const sekolah = profile?.sekolah;
  const roleName = peran?.namaTampilan || peran?.nama || "Belum tersedia";
  const avatarUrl = typeof profile?.avatar === "string" && /^https?:\/\//i.test(profile.avatar) ? profile.avatar : "";

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active="profile" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((v) => !v)}
          notifications={[]}
          user={{ name: nama, email: profile?.email || "", avatar: avatarUrl || getInitials(nama) }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
            
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">Profil Pengguna</h1>
                <p className="theme-text-secondary mt-1 text-sm">Kelola informasi pribadi, data sekolah, dan review akun Anda.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={refreshing} onClick={() => fetchProfile(true)} className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-60">
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Segarkan
                </button>
                <button type="button" onClick={() => router.push("/admin/profile/edit")} className="theme-primary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90">
                  <Edit size={16} /> Edit Profil
                </button>
              </div>
            </section>

            {error && (
              <section className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Gagal Memuat Profil</p>
                  <p className="mt-1">{error}</p>
                </div>
                <button onClick={() => fetchProfile(true)} className="font-semibold underline hover:text-red-900">Coba lagi</button>
              </section>
            )}

            {profile && (
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                
               
                <div className="space-y-6 lg:col-span-1 sticky top-0">
                  <section className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
                    <div className="h-28 w-full" style={{ background: "linear-gradient(110deg, var(--color-primary), #3b82f6)" }} />
                    <div className="relative px-6 pb-6">
                      <div className="flex justify-center">
                        <div className="relative -mt-14">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={nama} className="h-28 w-28 rounded-full border-4 border-[var(--color-card)] object-cover shadow-md" />
                          ) : (
                            <div className="theme-primary flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--color-card)] text-3xl font-bold shadow-md">
                              {getInitials(nama)}
                            </div>
                          )}
                          <button type="button" onClick={() => router.push("/admin/profile/edit")} className="theme-card theme-border absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm hover:bg-black/5">
                            <Camera size={14} className="theme-text" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <h2 className="theme-text text-lg font-bold">{nama}</h2>
                        <p className="theme-text-secondary text-sm">{displayValue(profile.jabatan)}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          <span className="theme-primary inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1 text-xs font-semibold theme-primary-text">
                            <Shield size={12} /> {roleName}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle size={12} /> {displayValue(profile.status)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 border-t theme-border pt-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="theme-text-muted text-[10px] font-bold uppercase">Bergabung</p>
                            <p className="theme-text mt-1 text-xs font-semibold">{formatDate(profile.dibuatPada)}</p>
                          </div>
                          <div className="text-center border-l theme-border">
                            <p className="theme-text-muted text-[10px] font-bold uppercase">Terakhir Login</p>
                            <p className="theme-text mt-1 text-xs font-semibold">{formatDate(profile.terakhirLogin, true)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="theme-card theme-border rounded-xl border p-4 shadow-sm">
                     <SectionHeader icon={Settings} title="Menu Cepat" />
                     <div className="space-y-1">
                        <button onClick={() => router.push("/admin/settings")} className="flex w-full items-center justify-between rounded-lg p-2 text-sm theme-text hover:bg-black/5">
                          <span className="flex items-center gap-2"><Settings size={16}/> Pengaturan Akun</span>
                          <ChevronRight size={16} className="theme-text-muted"/>
                        </button>
                        <button onClick={handleLogout} className="flex w-full items-center justify-between rounded-lg p-2 text-sm text-red-600 hover:bg-red-50">
                          <span className="flex items-center gap-2"><LogOut size={16}/> Logout</span>
                          <ChevronRight size={16} className="opacity-50"/>
                        </button>
                     </div>
                  </section>
                </div>

             
                <div className="space-y-6 lg:col-span-2">
                  
                  
                  <ReviewSection />

                 
                  <section className="theme-card theme-border rounded-xl border p-5 shadow-sm sm:p-6">
                    <SectionHeader icon={User} title="Informasi Pribadi" />
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <InfoRow icon={User} label="Nama Lengkap" value={profile.namaLengkap} />
                      <InfoRow icon={UserCircle} label="Username" value={profile.namaPengguna} />
                      <InfoRow icon={Mail} label="Email" value={profile.email} />
                      <InfoRow icon={Phone} label="Telepon" value={profile.noTelepon} />
                      <div className="sm:col-span-2 border-t theme-border my-1" />
                      <InfoRow icon={MapPin} label="Tempat Lahir" value={profile.tempatLahir} />
                      <InfoRow icon={Calendar} label="Tanggal Lahir" value={formatDate(profile.tanggalLahir)} />
                      <InfoRow icon={FileText} label="NIP" value={profile.nip} />
                      <InfoRow icon={FileText} label="NUPTK" value={profile.nuptk} />
                      <div className="sm:col-span-2 border-t theme-border my-1" />
                      <InfoRow icon={MapPin} label="Alamat Lengkap" value={profile.alamat} isFullWidth />
                      <InfoRow icon={MapPin} label="Alamat Domisili" value={profile.alamatDomisili} isFullWidth />
                    </div>
                  </section>

                 
                  <section className="theme-card theme-border rounded-xl border p-5 shadow-sm sm:p-6">
                    <SectionHeader icon={Building2} title="Informasi Sekolah" />
                    {sekolah ? (
                      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                        <InfoRow icon={School} label="Nama Sekolah" value={sekolah.nama} />
                        <InfoRow icon={FileText} label="Kode Sekolah" value={sekolah.kode} />
                        <InfoRow icon={Mail} label="Email Sekolah" value={sekolah.email} />
                        <InfoRow icon={Phone} label="Telepon Sekolah" value={sekolah.telepon} />
                        <InfoRow icon={Building2} label="Subdomain" value={sekolah.subdomain} />
                        <InfoRow icon={CheckCircle} label="Status" value={sekolah.status} />
                        <InfoRow icon={MapPin} label="Alamat Sekolah" value={sekolah.alamat} isFullWidth />
                      </div>
                    ) : (
                      <p className="theme-text-secondary text-sm italic">Tidak ada data sekolah yang terhubung.</p>
                    )}
                  </section>

                  <section className="theme-card theme-border rounded-xl border p-5 shadow-sm sm:p-6">
                    <SectionHeader icon={BadgeCheck} title="Detail Peran (Role)" />
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <InfoRow icon={Shield} label="Nama Peran" value={peran?.nama} />
                      <InfoRow icon={UserCircle} label="Nama Tampilan" value={peran?.namaTampilan} />
                      <InfoRow icon={Activity} label="Deskripsi" value={peran?.deskripsi} isFullWidth />
                    </div>
                  </section>

                </div>
              </div>
            )}

            <footer className="mt-8 border-t theme-border py-6 text-center">
              <p className="theme-text-muted text-xs font-medium">SmartSchool Enterprise &bull; Sistem Informasi Manajemen Sekolah</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}