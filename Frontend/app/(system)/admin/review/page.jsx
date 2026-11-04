
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getReviewSaya,
  createReviewSaya,
  updateReviewSaya,
} from "../../../../services/review.service";

const MAX_KOMENTAR = 500;

const STATUS_REVIEW = {
  menunggu: {
    label: "Menunggu Moderasi",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    description:
      "Review kamu sudah tersimpan dan sedang menunggu pemeriksaan Super Admin.",
  },
  tampil: {
    label: "Ditampilkan",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    description:
      "Review kamu sudah disetujui dan dapat ditampilkan kepada pengunjung.",
  },
  disembunyikan: {
    label: "Disembunyikan",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    description:
      "Review kamu sedang disembunyikan. Jika diedit, review akan kembali menunggu moderasi.",
  },
};

function getErrorMessage(error) {
  if (error?.message) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}

function extractReview(response) {
  // Mendukung respons standar { success, data }.
  // Jika apiFetch sudah mengembalikan data secara langsung,
  // objek review tetap dapat dibaca.
  if (response && Object.prototype.hasOwnProperty.call(response, "data")) {
    return response.data;
  }

  return response ?? null;
}

export default function ReviewSayaPage() {
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const loadReview = useCallback(async () => {
    setLoading(true);
    setError("");

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
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const komentarBersih = komentar.trim();

    if (!rating || rating < 1 || rating > 5) {
      setError("Silakan pilih rating antara 1 sampai 5 bintang.");
      return;
    }

    if (!komentarBersih) {
      setError("Komentar wajib diisi.");
      return;
    }

    if (komentarBersih.length > MAX_KOMENTAR) {
      setError(`Komentar maksimal ${MAX_KOMENTAR} karakter.`);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        rating,
        komentar: komentarBersih,
      };

      const response = review
        ? await updateReviewSaya(payload)
        : await createReviewSaya(payload);

      const savedReview = extractReview(response);

      if (savedReview) {
        setReview(savedReview);
        setRating(Number(savedReview.rating) || rating);
        setKomentar(savedReview.komentar || komentarBersih);
      } else {
        await loadReview();
      }

      setSuccess(
        review
          ? "Review berhasil diperbarui. Status review kembali menunggu moderasi."
          : "Review berhasil dikirim dan menunggu moderasi Super Admin."
      );
    } catch (err) {
      const message = getErrorMessage(err);

      if (
        !review &&
        (message.includes("409") ||
          message.toLowerCase().includes("sudah ada") ||
          message.toLowerCase().includes("already exists"))
      ) {
        setError(
          "Review untuk akun ini sudah ada. Muat ulang halaman untuk melihat review tersebut."
        );
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const statusInfo = review
    ? STATUS_REVIEW[review.status] || STATUS_REVIEW.menunggu
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          Memuat data review...
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-sm font-medium text-emerald-700">
          Admin Sekolah
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Review Saya
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Bagikan pengalaman kamu menggunakan SmartSchool. Masukan ini
          membantu kami mengevaluasi dan meningkatkan kualitas sistem.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span className="font-semibold">Gagal:</span>
          <span className="min-w-0 flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="font-medium hover:text-red-900"
            aria-label="Tutup pesan error"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span className="font-semibold">Berhasil:</span>
          <span className="min-w-0 flex-1">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="font-medium hover:text-emerald-950"
            aria-label="Tutup pesan sukses"
          >
            ×
          </button>
        </div>
      )}

      {review && statusInfo && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Status Review
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {statusInfo.description}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-md px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Dikirim pada</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {review.dibuatPada
                  ? new Date(review.dibuatPada).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Terakhir diperbarui</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {review.diperbaruiPada
                  ? new Date(review.diperbaruiPada).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-"}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">
            {review ? "Perbarui Review" : "Berikan Review"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {review
              ? "Kamu sudah memiliki review. Perubahan yang disimpan akan dikirim kembali untuk moderasi."
              : "Pilih rating dan tulis pengalaman kamu menggunakan SmartSchool."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <fieldset disabled={saving} className="space-y-3">
            <legend className="text-sm font-semibold text-slate-800">
              Rating sistem <span className="text-red-600">*</span>
            </legend>

            <div
              className="flex flex-wrap items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
              role="radiogroup"
              aria-label="Rating SmartSchool"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const active = (hoverRating || rating) >= value;

                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} dari 5 bintang`}
                    onMouseEnter={() => setHoverRating(value)}
                    onFocus={() => setHoverRating(value)}
                    onBlur={() => setHoverRating(0)}
                    onClick={() => setRating(value)}
                    className={`rounded-md p-1 text-3xl transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      active
                        ? "text-amber-400"
                        : "text-slate-300 hover:text-amber-300"
                    }`}
                  >
                    ★
                  </button>
                );
              })}

              <span className="ml-2 text-sm text-slate-600">
                {rating > 0 ? `${rating} dari 5` : "Belum ada rating"}
              </span>
            </div>
          </fieldset>

          <div className="space-y-2">
            <label
              htmlFor="komentar-review"
              className="block text-sm font-semibold text-slate-800"
            >
              Komentar <span className="text-red-600">*</span>
            </label>

            <textarea
              id="komentar-review"
              name="komentar"
              rows={6}
              maxLength={MAX_KOMENTAR}
              value={komentar}
              onChange={(event) => setKomentar(event.target.value)}
              placeholder="Ceritakan pengalaman kamu menggunakan SmartSchool..."
              disabled={saving}
              required
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Hindari memasukkan kata sandi atau data pribadi.
              </p>

              <span
                className={`shrink-0 text-xs ${
                  komentar.length >= MAX_KOMENTAR
                    ? "font-semibold text-red-600"
                    : "text-slate-500"
                }`}
              >
                {komentar.length}/{MAX_KOMENTAR}
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Review akan diperiksa oleh Super Admin sebelum ditampilkan.
            </p>

            <button
              type="submit"
              disabled={saving || !rating || !komentar.trim()}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : review
                  ? "Simpan Perubahan"
                  : "Kirim Review"}
            </button>
          </div>
        </form>
      </section>

      {review && (
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Ringkasan Review Kamu
          </h2>

          <div
            className="mt-2 text-lg tracking-wide text-amber-400"
            aria-label={`Rating ${review.rating} dari 5`}
          >
            {"★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}
            <span className="text-slate-300">
              {"★".repeat(
                5 - Math.max(0, Math.min(5, Number(review.rating) || 0))
              )}
            </span>
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {review.komentar}
          </p>
        </section>
      )}
    </main>
  );
}
