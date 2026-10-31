"use client";

import { useEffect, useRef, useState } from "react";

import {
  AlertCircle,
  Check,
  Copy,
  Link2,
  X,
} from "lucide-react";

import {
  alasanTautanTidakTersedia,
  basePathTenantSaatIni,
  buatTautanPendaftaran,
  dapatkanSubdomainDariKonteks,
} from "@/app/components/spmb/tautanPendaftaran";

import { getProfile } from "@/services/user.service";

export {
  alasanTautanTidakTersedia,
  basePathTenantSaatIni,
  buatTautanPendaftaran,
  dapatkanSubdomainDariKonteks,
};

export default function TautanPendaftaranModal({
  jalur,
  open,
  onClose,
  basePath,
  subdomain,
  sekolah,
}) {
  const inputRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [profileSubdomain, setProfileSubdomain] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  const alasanModal = open
    ? alasanTautanTidakTersedia(jalur)
    : "";

  const subdomainSync = open
    ? dapatkanSubdomainDariKonteks(jalur, {
        basePath,
        subdomain,
        sekolah,
      })
    : "";

  const subdomainAktif = subdomainSync || profileSubdomain;
  const basePathAktif = subdomainAktif ? `/${subdomainAktif}` : "";

  const alasanTenant =
    open && !alasanModal && !subdomainAktif
      ? loadingProfile
        ? "Memeriksa subdomain sekolah..."
        : "Subdomain sekolah tidak ditemukan untuk konteks akun saat ini. Pastikan akun terhubung ke data sekolah dengan subdomain yang valid."
      : "";

  const tautan =
    open && basePathAktif
      ? buatTautanPendaftaran(jalur, {
          basePath: basePathAktif,
          subdomain: subdomainAktif,
        })
      : "";

  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        setCopied(false);
        setError("");
      });
    }
  }, [open, jalur?.id]);

  useEffect(() => {
    if (!open) return;
    if (subdomainSync) return;

    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoadingProfile(true);
    });

    getProfile()
      .then((response) => {
        if (cancelled) return;
        const sub = response?.data?.sekolah?.subdomain;
        if (sub && typeof sub === "string") {
          setProfileSubdomain(sub.trim().replace(/^\/+|\/+$/g, ""));
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil profil sekolah untuk tautan PPDB:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, subdomainSync]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleCopy = async () => {
    setError("");

    if (!tautan) {
      setError(
        alasanModal ||
          alasanTenant ||
          "Tautan tidak dapat dibuat karena ID sekolah atau ID jalur tidak valid."
      );

      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(tautan);
        setCopied(true);
      } else if (inputRef.current) {
        inputRef.current.select();
        const ok = document.execCommand("copy");
        if (!ok) throw new Error("Gagal menyalin tautan.");
        setCopied(true);
      } else {
        throw new Error("Clipboard tidak tersedia.");
      }
    } catch {
      setCopied(false);
      setError(
        "Browser tidak mengizinkan penyalinan otomatis. Pilih teks tautan di bawah lalu salin secara manual."
      );

      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  const statusNonaktif =
    String(jalur?.status || "").toLowerCase() !== "aktif";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_38%,transparent)] p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-tautan-pendaftaran"
        className="theme-card w-full max-w-lg rounded-xl p-6 shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-[var(--color-primary)]">
              <Link2 size={19} />
            </div>

            <div>
              <h3
                id="judul-tautan-pendaftaran"
                className="theme-text text-sm font-semibold"
              >
                Tautan Pendaftaran
              </h3>

              <p className="theme-text-secondary mt-1 text-xs leading-5">
                Bagikan tautan ini kepada calon peserta didik
                untuk jalur{" "}
                <span className="theme-text font-semibold">
                  {jalur?.nama || "-"}
                </span>
                .
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-text-muted shrink-0 transition hover:text-[var(--color-text)]"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          <label
            htmlFor="tautan-pendaftaran"
            className="theme-text-secondary mb-1 block text-xs font-medium"
          >
            URL pendaftaran
          </label>

          <input
            id="tautan-pendaftaran"
            ref={inputRef}
            type="text"
            readOnly
            value={
              tautan ||
              alasanModal ||
              alasanTenant ||
              "ID sekolah atau ID jalur tidak tersedia"
            }
            onFocus={(event) => event.target.select()}
            className="theme-input theme-text w-full rounded-md border px-3 py-2 text-xs outline-none"
          />
        </div>

        {(alasanModal || alasanTenant || error) && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] px-3 py-2 text-xs text-[var(--color-warning)]">
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0"
            />

            <span className="leading-5">
              {error || alasanModal || alasanTenant}
            </span>
          </div>
        )}

        {statusNonaktif && !alasanModal && !alasanTenant && (
          <div className="mt-3 rounded-md border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] px-3 py-2 text-xs leading-5 text-[var(--color-warning)]">
            Jalur ini berstatus nonaktif. Formulir tetap dapat dibuka,
            tetapi pendaftaran akan ditolak Backend bila jalur tidak
            dibuka.
          </div>
        )}

        <div className="mt-4 rounded-md bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-3 py-2.5">
          <p className="theme-text-secondary text-[11px] leading-5">
            Tautan memuat <code>sekolahId</code> dan{" "}
            <code>jalurPpdbId</code> asli dari data jalur ini.
            Pastikan jalur berstatus aktif dan sesuai
            dengan periode pendaftaran sekolah sebelum
            dibagikan. Calon peserta didik tidak perlu
            mengetik ID apa pun.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="theme-text-secondary rounded-md px-4 py-2 text-xs font-medium transition hover:text-[var(--color-text)]"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!tautan}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copied ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}

            {copied ? "Tersalin" : "Salin Tautan"}
          </button>
        </div>
      </div>
    </div>
  );
}
