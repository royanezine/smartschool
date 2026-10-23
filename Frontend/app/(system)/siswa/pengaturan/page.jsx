"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";

export default function PengaturanSiswaPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="theme-page min-h-full flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1000px] p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Preferensi Akun
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-[28px]">
            Pengaturan
          </h1>

          <p className="mt-1 text-sm theme-text-muted">
            Kelola keamanan akun kamu.
          </p>
        </header>

        {error && (
          <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="theme-success mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
            <Check size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="space-y-6">
          <KeamananSection
            onSuccess={setSuccess}
            onError={setError}
          />

          <div className="theme-info flex items-start gap-3 rounded-2xl p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[var(--color-info)]"
            />
            <div>
              <p className="text-sm font-semibold theme-text">
                Tips keamanan akun
              </p>
              <p className="mt-1 text-xs leading-5 theme-text-muted">
                Gunakan kata sandi yang kuat, jangan membagikan kata sandi
                kepada orang lain, dan pastikan informasi akun tetap aman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


function SettingsCard({ icon: Icon, title, desc, children }) {
  return (
    <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex items-center gap-3 border-b theme-border-soft px-5 py-4 sm:px-6">
        <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold theme-text">{title}</h2>
          {desc && (
            <p className="mt-0.5 text-xs leading-5 theme-text-muted">
              {desc}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}


function KeamananSection({ onSuccess, onError }) {
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasiSandi, setKonfirmasiSandi] = useState("");
  const [showSandi, setShowSandi] = useState(false);

  const cocok =
    sandiBaru.length > 0 && sandiBaru === konfirmasiSandi;

  const memenuhiSyarat = sandiBaru.length >= 8;
  const formValid =
    sandiLama.length > 0 &&
    memenuhiSyarat &&
    cocok;

  function handleSave() {
    onSuccess("");
    onError(
      "Kata sandi belum diubah. Hubungkan tombol ini ke endpoint ubah kata sandi backend terlebih dahulu."
    );
  }

  return (
    <SettingsCard
      icon={Lock}
      title="Keamanan Akun"
      desc="Ubah kata sandi untuk menjaga keamanan akun kamu."
    >
      <div className="space-y-4">
        <PasswordInput
          label="Kata Sandi Saat Ini"
          value={sandiLama}
          onChange={setSandiLama}
          show={showSandi}
          onToggle={() => setShowSandi((value) => !value)}
          placeholder="Masukkan kata sandi saat ini"
        />

        <div>
          <PasswordInput
            label="Kata Sandi Baru"
            value={sandiBaru}
            onChange={setSandiBaru}
            show={showSandi}
            onToggle={() => setShowSandi((value) => !value)}
            placeholder="Minimal 8 karakter"
          />

          {sandiBaru.length > 0 && !memenuhiSyarat && (
            <p className="mt-1.5 text-xs text-[var(--color-danger)]">
              Kata sandi baru harus memiliki minimal 8 karakter.
            </p>
          )}
        </div>

        <div>
          <PasswordInput
            label="Konfirmasi Kata Sandi Baru"
            value={konfirmasiSandi}
            onChange={setKonfirmasiSandi}
            show={showSandi}
            onToggle={() => setShowSandi((value) => !value)}
            placeholder="Ulangi kata sandi baru"
          />

          {konfirmasiSandi.length > 0 && !cocok && (
            <p className="mt-1.5 text-xs text-[var(--color-danger)]">
              Konfirmasi kata sandi tidak cocok.
            </p>
          )}
        </div>

        <div className="theme-card-soft theme-border-soft flex items-start gap-3 rounded-xl border p-3.5">
          <Info
            size={17}
            className="mt-0.5 shrink-0 theme-text-muted"
          />
          <p className="text-xs leading-5 theme-text-muted">
            Untuk keamanan, perubahan kata sandi harus divalidasi oleh backend.
            Tombol di bawah belum mengirim perubahan ke server.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t theme-border-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs theme-text-placeholder">
            Disarankan menggunakan kata sandi yang unik.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={!formValid}
            className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock size={15} />
            Ubah Kata Sandi
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}) {
  return (
    <div>
      <label className="text-xs font-semibold theme-text-secondary">
        {label}
      </label>

      <div className="relative mt-1.5">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="off"
          className="theme-input h-11 w-full rounded-xl px-3.5 pr-11 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted transition hover:text-[var(--color-text)]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}