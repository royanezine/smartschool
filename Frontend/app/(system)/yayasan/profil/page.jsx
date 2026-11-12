"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Hash,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  RotateCcw,
  Landmark,
  ShieldCheck,
  Edit,
  Star,
  MessageSquareQuote,
  Send,
  CalendarDays,
  Eye,
  Clock3,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import {
  getReviewSaya,
  createReviewSaya,
  updateReviewSaya,
  getPublicReviews,
} from "@/services/review.service";

const INITIAL_FORM = {
  user: {
    namaLengkap: "",
    email: "",
    noTelepon: "",
  },
  yayasan: {
    nama: "",
    npyp: "",
    alamat: "",
    telepon: "",
    email: "",
  },
};

const INITIAL_REVIEW = {
  rating: 5,
  komentar: "",
};

function normalizeString(value) {
  return value == null ? "" : String(value);
}

function normalizeProfile(data) {
  return {
    user: {
      namaLengkap: normalizeString(data?.user?.namaLengkap),
      email: normalizeString(data?.user?.email),
      noTelepon: normalizeString(data?.user?.noTelepon),
    },
    yayasan: {
      nama: normalizeString(data?.yayasan?.nama),
      npyp: normalizeString(data?.yayasan?.npyp),
      alamat: normalizeString(data?.yayasan?.alamat),
      telepon: normalizeString(data?.yayasan?.telepon),
      email: normalizeString(data?.yayasan?.email),
    },
  };
}

function getErrorMessage(error, fallback) {
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function getDateLabel(value) {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReviewStatusLabel(status) {
  switch (status) {
    case "tampil":
      return "Ditampilkan";
    case "disembunyikan":
      return "Disembunyikan";
    case "menunggu":
      return "Menunggu moderasi";
    default:
      return status || "Status tidak tersedia";
  }
}

function getReviewStatusClass(status) {
  switch (status) {
    case "tampil":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "disembunyikan":
      return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";
    case "menunggu":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    default:
      return "border-[var(--color-border)] bg-[var(--color-card)] theme-text-muted";
  }
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  required = false,
  disabled = false,
  multiline = false,
  maxLength,
  helper,
}) {
  const inputClass =
    "w-full rounded-lg border theme-border bg-[var(--color-card)] px-3 py-2.5 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] disabled:cursor-not-allowed disabled:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-70";

  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold theme-text"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-3 theme-text-muted"
          />
        )}

        {multiline ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            rows={4}
            className={`${inputClass} resize-y ${Icon ? "pl-9" : ""}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            autoComplete="off"
            className={`${inputClass} ${Icon ? "pl-9" : ""}`}
          />
        )}
      </div>

      {helper && <p className="mt-1.5 text-xs theme-text-muted">{helper}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description, right }) {
  return (
    <div className="flex flex-col gap-3 border-b theme-border pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
          <Icon size={20} className="theme-primary-text" />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold theme-text">{title}</h2>
          <p className="mt-1 text-sm theme-text-muted">{description}</p>
        </div>
      </div>

      {right}
    </div>
  );
}

function StarRating({ rating = 0, interactive = false, onChange, size = 18 }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${rating} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          aria-label={`${star} bintang`}
          className={`rounded-sm transition ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          }`}
        >
          <Star
            size={size}
            className={
              star <= Number(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-500/40"
            }
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const nama =
    review?.pengguna?.namaLengkap?.trim() || "Pengguna SmartSchool";

  const jabatan =
    review?.pengguna?.jabatan ||
    review?.pengguna?.peran?.namaTampilan ||
    review?.pengguna?.peran?.nama ||
    "Pengguna";

  return (
    <article className="theme-border theme-card flex h-full flex-col rounded-xl border p-4 transition hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] font-bold theme-primary-text">
            {nama.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="theme-text truncate text-sm font-bold">{nama}</p>
            <p className="theme-text-muted mt-0.5 truncate text-xs">{jabatan}</p>
          </div>
        </div>

        <MessageSquareQuote size={20} className="theme-primary-text shrink-0 opacity-60" />
      </div>

      <div className="mt-4">
        <StarRating rating={review?.rating || 0} />
      </div>

      <p className="theme-text-muted mt-3 flex-1 whitespace-pre-line break-words text-sm leading-6">
        {review?.komentar || "Tidak ada komentar."}
      </p>

      <div className="theme-border theme-text-muted mt-4 flex items-center gap-2 border-t pt-3 text-xs">
        <CalendarDays size={14} />
        <span>{getDateLabel(review?.dibuatPada)}</span>
      </div>
    </article>
  );
}

export default function ProfilYayasanPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [initialForm, setInitialForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [review, setReview] = useState(null);
  const [reviewForm, setReviewForm] = useState(INITIAL_REVIEW);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [publicReviews, setPublicReviews] = useState([]);
  const [publicReviewLoading, setPublicReviewLoading] = useState(true);
  const [publicReviewError, setPublicReviewError] = useState("");

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const hasOwnReview = Boolean(review?.id);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/yayasan/profil-lengkap", {
        method: "GET",
      });

      const responseData = response?.data ?? response;
      const normalized = normalizeProfile(responseData);

      setForm(normalized);
      setInitialForm(normalized);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengambil data profil yayasan."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyReview = useCallback(async () => {
    setReviewLoading(true);
    setReviewError("");

    try {
      const response = await getReviewSaya();
      const data = response?.data ?? null;

      setReview(data);

      if (data) {
        setReviewForm({
          rating: Number(data.rating) || 5,
          komentar: normalizeString(data.komentar),
        });
      } else {
        setReviewForm(INITIAL_REVIEW);
      }
    } catch (err) {
      setReviewError(getErrorMessage(err, "Gagal memuat review Anda."));
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const loadPublicReviews = useCallback(async () => {
    setPublicReviewLoading(true);
    setPublicReviewError("");

    try {
      const response = await getPublicReviews({
        page: 1,
        limit: 6,
      });

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setPublicReviews(data);
    } catch (err) {
      setPublicReviewError(
        getErrorMessage(err, "Gagal memuat testimoni pengguna.")
      );
    } finally {
      setPublicReviewLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadMyReview();
    loadPublicReviews();
  }, [loadProfile, loadMyReview, loadPublicReviews]);

  const handleUserChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      user: { ...previous.user, [name]: value },
    }));
    setError("");
    setSuccess("");
  };

  const handleYayasanChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      yayasan: { ...previous.yayasan, [name]: value },
    }));
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditMode(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    const namaLengkap = form.user.namaLengkap.trim();
    const namaYayasan = form.yayasan.nama.trim();
    const npyp = form.yayasan.npyp.trim();

    if (namaLengkap.length < 2) {
      setError("Nama lengkap minimal 2 karakter.");
      return;
    }

    if (namaYayasan.length < 3) {
      setError("Nama yayasan minimal 3 karakter.");
      return;
    }

    if (npyp.length < 3) {
      setError("NPYP minimal 3 karakter.");
      return;
    }

    const emailFields = [
      { label: "Email admin", value: form.user.email },
      { label: "Email yayasan", value: form.yayasan.email },
    ];

    for (const item of emailFields) {
      const email = item.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(`${item.label} tidak memiliki format yang valid.`);
        return;
      }
    }

    const payload = {
      user: {
        namaLengkap,
        noTelepon: form.user.noTelepon.trim() || null,
      },
      yayasan: {
        nama: namaYayasan,
        npyp,
        alamat: form.yayasan.alamat.trim() || null,
        telepon: form.yayasan.telepon.trim() || null,
        email: form.yayasan.email.trim() || null,
      },
    };

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch("/yayasan/profil-lengkap", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await loadProfile();
      setEditMode(false);
      setSuccess("Profil yayasan berhasil diperbarui.");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menyimpan profil yayasan."));
    } finally {
      setSaving(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (reviewSaving) return;

    const komentar = reviewForm.komentar.trim();
    const rating = Number(reviewForm.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setReviewError("Silakan pilih rating antara 1 sampai 5 bintang.");
      return;
    }

    if (komentar.length < 3) {
      setReviewError("Komentar minimal 3 karakter.");
      return;
    }

    setReviewSaving(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const payload = { rating, komentar };

      if (hasOwnReview) {
        await updateReviewSaya(payload);
      } else {
        await createReviewSaya(payload);
      }

      await loadMyReview();
      await loadPublicReviews();

      setReviewSuccess(
        hasOwnReview
          ? "Review Anda berhasil diperbarui."
          : "Review berhasil dikirim. Review mungkin perlu dimoderasi sebelum tampil secara publik."
      );
    } catch (err) {
      setReviewError(getErrorMessage(err, "Gagal menyimpan review Anda."));
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
            <Building2 size={25} className="theme-primary-text" />
          </div>

          <div>
            <h1 className="theme-text text-2xl font-bold tracking-tight">
              Profil Yayasan
            </h1>
            <p className="theme-text-muted mt-1 text-sm">
              Kelola informasi akun, identitas yayasan, dan ulasan Anda.
            </p>
          </div>
        </div>

        {!loading && !editMode && (
          <button
            type="button"
            onClick={() => {
              setEditMode(true);
              setError("");
              setSuccess("");
            }}
            className="theme-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
          >
            <Edit size={16} />
            Edit Profil
          </button>
        )}
      </div>

      {/* PROFILE ALERTS */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Terjadi kesalahan</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-lg leading-none hover:opacity-70"
            aria-label="Tutup pesan"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1 font-medium">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="hover:opacity-70"
            aria-label="Tutup pesan"
          >
            ×
          </button>
        </div>
      )}

      {/* PROFILE FORM */}
      {loading ? (
        <div className="theme-border theme-card flex min-h-[320px] flex-col items-center justify-center rounded-xl border">
          <LoaderCircle size={32} className="theme-primary-text animate-spin" />
          <p className="theme-text-muted mt-3 text-sm font-medium">
            Memuat profil yayasan...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 2xl:grid-cols-4">
            <div className="space-y-6 xl:col-span-2 2xl:col-span-3">
              {/* ADMIN INFORMATION */}
              <section className="theme-border theme-card rounded-xl border p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={UserRound}
                  title="Informasi Admin"
                  description="Informasi akun admin yayasan yang sedang login."
                />

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label="Nama Lengkap"
                    name="namaLengkap"
                    value={form.user.namaLengkap}
                    onChange={handleUserChange}
                    placeholder="Masukkan nama lengkap"
                    icon={UserRound}
                    required
                    disabled={!editMode || saving}
                    maxLength={100}
                  />

                  <FormField
                    label="Email Akun"
                    name="email"
                    value={form.user.email}
                    onChange={handleUserChange}
                    placeholder="admin@yayasan.id"
                    icon={Mail}
                    type="email"
                    disabled
                    helper="Email akun tidak dapat diubah melalui endpoint profil ini."
                  />

                  <div className="sm:col-span-2">
                    <FormField
                      label="Nomor Telepon Admin"
                      name="noTelepon"
                      value={form.user.noTelepon}
                      onChange={handleUserChange}
                      placeholder="Contoh: 081234567890"
                      icon={Phone}
                      type="tel"
                      disabled={!editMode || saving}
                      maxLength={20}
                    />
                  </div>
                </div>
              </section>

              {/* FOUNDATION INFORMATION */}
              <section className="theme-border theme-card rounded-xl border p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={Landmark}
                  title="Identitas Yayasan"
                  description="Informasi resmi yayasan yang terdaftar di SmartSchool."
                />

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormField
                      label="Nama Yayasan"
                      name="nama"
                      value={form.yayasan.nama}
                      onChange={handleYayasanChange}
                      placeholder="Masukkan nama yayasan"
                      icon={Building2}
                      required
                      disabled={!editMode || saving}
                      maxLength={100}
                    />
                  </div>

                  <FormField
                    label="NPYP"
                    name="npyp"
                    value={form.yayasan.npyp}
                    onChange={handleYayasanChange}
                    placeholder="Masukkan nomor NPYP"
                    icon={Hash}
                    required
                    disabled={!editMode || saving}
                    maxLength={50}
                  />

                  <FormField
                    label="Telepon Yayasan"
                    name="telepon"
                    value={form.yayasan.telepon}
                    onChange={handleYayasanChange}
                    placeholder="Nomor telepon yayasan"
                    icon={Phone}
                    type="tel"
                    disabled={!editMode || saving}
                    maxLength={20}
                  />

                  <div className="sm:col-span-2">
                    <FormField
                      label="Email Yayasan"
                      name="email"
                      value={form.yayasan.email}
                      onChange={handleYayasanChange}
                      placeholder="kontak@yayasan.id"
                      icon={Mail}
                      type="email"
                      disabled={!editMode || saving}
                      maxLength={100}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <FormField
                      label="Alamat Yayasan"
                      name="alamat"
                      value={form.yayasan.alamat}
                      onChange={handleYayasanChange}
                      placeholder="Masukkan alamat lengkap yayasan"
                      icon={MapPin}
                      multiline
                      disabled={!editMode || saving}
                      maxLength={10000}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT SUMMARY */}
            <div className="space-y-6">
              <section className="theme-border theme-card overflow-hidden rounded-xl border shadow-sm">
                <div className="theme-border border-b bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-5 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                    <Building2 size={24} className="theme-primary-text" />
                  </div>

                  <h2 className="theme-text mt-4 break-words text-lg font-bold">
                    {form.yayasan.nama || "Nama Yayasan"}
                  </h2>

                  <p className="theme-text-muted mt-1 text-sm">
                    Profil Organisasi
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex items-start gap-3">
                    <Hash
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px] font-bold uppercase tracking-wider">
                        NPYP
                      </p>
                      <p className="theme-text mt-1 break-words text-sm font-semibold">
                        {form.yayasan.npyp || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px] font-bold uppercase tracking-wider">
                        Email Yayasan
                      </p>
                      <p className="theme-text mt-1 break-all text-sm font-semibold">
                        {form.yayasan.email || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px] font-bold uppercase tracking-wider">
                        Telepon
                      </p>
                      <p className="theme-text mt-1 break-words text-sm font-semibold">
                        {form.yayasan.telepon || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px] font-bold uppercase tracking-wider">
                        Alamat
                      </p>
                      <p className="theme-text mt-1 whitespace-pre-line break-words text-sm font-semibold">
                        {form.yayasan.alamat || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
                    <ShieldCheck size={19} className="theme-primary-text" />
                  </div>

                  <div>
                    <h3 className="theme-text text-sm font-semibold">
                      Pengelolaan Profil
                    </h3>
                    <p className="theme-text-secondary mt-1 text-sm leading-relaxed">
                      Simpan perubahan profil agar informasi yayasan tetap
                      akurat di sistem SmartSchool.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* EDIT ACTIONS */}
          {editMode && (
            <div className="theme-border sticky bottom-0 z-10 -mx-4 border-t bg-[var(--color-card)]/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="mx-auto flex max-w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-sm font-medium">
                  {isDirty
                    ? "Ada perubahan yang belum disimpan."
                    : "Belum ada perubahan."}
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="theme-border theme-text inline-flex items-center justify-center gap-2 rounded-lg border bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={loadProfile}
                    disabled={saving || loading}
                    className="theme-border theme-text inline-flex items-center justify-center gap-2 rounded-lg border bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                  >
                    <RefreshCw size={16} />
                    Muat Ulang
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className="theme-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}

      {/* =====================================================
          REVIEW & TESTIMONI
      ===================================================== */}

      <section className="theme-border theme-card mt-8 rounded-xl border p-5 shadow-sm sm:p-6">
        <SectionHeader
          icon={MessageSquareQuote}
          title="Review & Testimoni"
          description="Bagikan pengalaman menggunakan SmartSchool dan lihat ulasan pengguna lainnya."
          right={
            <button
              type="button"
              onClick={() => {
                loadMyReview();
                loadPublicReviews();
              }}
              disabled={reviewLoading || publicReviewLoading}
              className="theme-border theme-text inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  reviewLoading || publicReviewLoading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          }
        />

        {/* MY REVIEW */}
        <div className="theme-border mt-5 rounded-xl border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="theme-text font-semibold">
                {hasOwnReview ? "Review Saya" : "Bagaimana pengalaman Anda?"}
              </h3>
              <p className="theme-text-muted mt-1 text-sm">
                Berikan penilaian dan masukan untuk SmartSchool.
              </p>
            </div>

            {review && (
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getReviewStatusClass(
                  review.status
                )}`}
              >
                {review.status === "tampil" ? (
                  <Eye size={13} />
                ) : (
                  <Clock3 size={13} />
                )}
                {getReviewStatusLabel(review.status)}
              </span>
            )}
          </div>

          {reviewError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <p className="break-words">{reviewError}</p>
            </div>
          )}

          {reviewSuccess && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <p>{reviewSuccess}</p>
            </div>
          )}

          {reviewLoading ? (
            <div className="theme-text-muted flex min-h-32 items-center justify-center gap-2">
              <LoaderCircle size={20} className="theme-primary-text animate-spin" />
              <span className="text-sm">Memuat review Anda...</span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              <div>
                <label className="theme-text mb-2 block text-sm font-semibold">
                  Rating Anda
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <StarRating
                    rating={reviewForm.rating}
                    interactive
                    onChange={(rating) => {
                      setReviewForm((previous) => ({ ...previous, rating }));
                      setReviewError("");
                      setReviewSuccess("");
                    }}
                    size={25}
                  />

                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {reviewForm.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reviewKomentar"
                  className="theme-text mb-1.5 block text-sm font-semibold"
                >
                  Komentar
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  id="reviewKomentar"
                  value={reviewForm.komentar}
                  onChange={(event) => {
                    setReviewForm((previous) => ({
                      ...previous,
                      komentar: event.target.value,
                    }));
                    setReviewError("");
                    setReviewSuccess("");
                  }}
                  placeholder="Ceritakan pengalaman Anda menggunakan SmartSchool..."
                  rows={4}
                  maxLength={5000}
                  disabled={reviewSaving}
                  className="theme-border theme-text w-full resize-y rounded-lg border bg-[var(--color-card)] px-3 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] disabled:opacity-60"
                />

                <p className="theme-text-muted mt-1 text-right text-xs">
                  {reviewForm.komentar.length}/5000 karakter
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-xs leading-5">
                  Review yang baru dikirim mungkin perlu dimoderasi sebelum
                  ditampilkan ke pengguna lain.
                </p>

                <button
                  type="submit"
                  disabled={reviewSaving}
                  className="theme-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewSaving ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {hasOwnReview ? "Perbarui Review" : "Kirim Review"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* PUBLIC TESTIMONIALS */}
        <div className="mt-7">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="theme-text text-lg font-bold">
                Testimoni Pengguna
              </h3>
              <p className="theme-text-muted mt-1 text-sm">
                Ulasan yang telah ditampilkan secara publik.
              </p>
            </div>

            {!publicReviewLoading && publicReviews.length > 0 && (
              <span className="theme-text-muted text-xs">
                {publicReviews.length} testimoni ditampilkan
              </span>
            )}
          </div>

          {publicReviewError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <p className="break-words">{publicReviewError}</p>
            </div>
          )}

          {publicReviewLoading ? (
            <div className="theme-text-muted flex min-h-36 items-center justify-center gap-2">
              <LoaderCircle size={22} className="theme-primary-text animate-spin" />
              <span className="text-sm">Memuat testimoni...</span>
            </div>
          ) : publicReviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicReviews.map((item) => (
                <ReviewCard key={item.id} review={item} />
              ))}
            </div>
          ) : (
            <div className="theme-border rounded-xl border border-dashed px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                <MessageSquareQuote size={23} className="theme-primary-text" />
              </div>

              <h4 className="theme-text mt-3 text-sm font-semibold">
                Belum ada testimoni
              </h4>

              <p className="theme-text-muted mx-auto mt-1 max-w-md text-sm leading-6">
                Belum ada review yang ditampilkan secara publik. Jadilah salah
                satu pengguna yang memberikan masukan untuk SmartSchool.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}