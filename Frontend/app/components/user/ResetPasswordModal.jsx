"use client";

import { useRef, useState } from "react";
import {
  KeyRound,
  Copy,
  Check,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { resetUserPassword } from "@/services/user.service";

export default function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const isSubmittingRef = useRef(false);

  if (!isOpen || !user) return null;

  const userName =
    user.namaLengkap ||
    user.nama ||
    user.name ||
    user.username ||
    "Pengguna";

  const userIdentifier = user.email || user.username || `ID: ${user.id}`;
  const userRole =
    user.peran?.namaTampilan ||
    user.peran?.nama ||
    (typeof user.peran === "string" ? user.peran : null) ||
    user.role ||
    "-";

  const handleClose = () => {
    if (loading || isSubmittingRef.current) return;
    setTemporaryPassword("");
    setError("");
    setCopied(false);
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleConfirmReset = async () => {
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      setLoading(true);
      setError("");

      const response = await resetUserPassword(user.id);

      const kataSandi =
        response?.data?.kataSandi ||
        response?.data?.password;

      if (!kataSandi || typeof kataSandi !== "string" || !kataSandi.trim()) {
        throw new Error(
          "Backend tidak mengembalikan kata sandi sementara yang valid."
        );
      }

      setTemporaryPassword(kataSandi);

      if (typeof onSuccess === "function") {
        onSuccess(response);
      }
    } catch (err) {
      const errorMessage =
        err?.message ||
        "Gagal mereset kata sandi pengguna. Silakan coba beberapa saat lagi.";
      setError(errorMessage);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!temporaryPassword) return;

    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(temporaryPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else if (typeof document !== "undefined") {
        const textArea = document.createElement("textarea");
        textArea.value = temporaryPassword;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setError("Gagal menyalin otomatis. Silakan salin teks kata sandi secara manual.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reset-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border theme-border theme-card bg-white dark:bg-slate-900 shadow-2xl transition-all z-10">
        <div className="flex items-center justify-between border-b theme-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                temporaryPassword
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {temporaryPassword ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <KeyRound className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2
                id="modal-reset-password-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {temporaryPassword
                  ? "Kata Sandi Berhasil Direset"
                  : "Reset Kata Sandi"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {temporaryPassword
                  ? "Kata sandi sementara telah dibuat"
                  : "Konfirmasi pengaturan ulang kata sandi"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Tutup modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/40 p-3.5 text-sm text-red-700 dark:text-red-300"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed">{error}</div>
            </div>
          )}

          {!temporaryPassword ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40 p-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Target Pengguna
                </div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-white text-sm">
                  {userName}
                </div>
                <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                  {userIdentifier}
                </div>
                {userRole && userRole !== "-" && (
                  <div className="mt-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    Peran: {userRole}
                  </div>
                )}
              </div>

              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Apakah Anda yakin ingin mengatur ulang kata sandi pengguna ini?
                Sistem backend akan menghasilkan sebuah kata sandi acak sementara.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mereset Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Ya, Reset Kata Sandi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40 p-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Pengguna:
                </div>
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  {userName} ({userIdentifier})
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Kata Sandi Sementara:
                </label>
                <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/30 p-3">
                  <div
                    data-testid="temporary-password-display"
                    className="select-all font-mono text-lg font-bold tracking-wider text-emerald-900 dark:text-emerald-200"
                  >
                    {temporaryPassword}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                    title="Salin ke papan klip"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 dark:border-amber-900/40 dark:bg-amber-950/30 p-3 text-amber-800 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Penting:</strong> Salin dan berikan kata sandi ini kepada pengguna.
                  Demi alasan keamanan, kata sandi ini tidak disimpan di peramban dan tidak akan dapat dilihat kembali setelah jendela ini ditutup.
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-xs font-semibold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                >
                  Tutup & Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
