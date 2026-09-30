"use client";

import { useState } from "react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  Settings2,
  CalendarDays,
  Users,
  FileText,
  GraduationCap,
  ClipboardCheck,
  Save,
  CheckCircle2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// =========================================================
// PAGE
// =========================================================

export default function PengaturanSPMBPage() {
  const [collapsed, setCollapsed] = useState(false);

  const [settings, setSettings] = useState({
    pendaftaran: true,
    verifikasi: true,
    pembayaran: true,
    autoNumber: true,
    emailNotification: true,
    whatsappNotification: false,
  });

  const toggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setCollapsed((v) => !v)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col p-4 sm:p-5 lg:p-6">
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="mb-5 flex shrink-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
              >
                <Settings2
                  size={20}
                  className={themePrimaryText}
                />
              </div>

              <div>
                <h1 className="theme-text text-xl font-bold">
                  Pengaturan SPMB
                </h1>

                <p className="theme-text-muted text-xs">
                  Kelola konfigurasi sistem penerimaan siswa baru
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="grid gap-4 xl:grid-cols-3">
                {/* ================================================= */}
                {/* LEFT */}
                {/* ================================================= */}

                <div className="space-y-4 xl:col-span-2">
                  {/* PERIODE */}

                  <SettingSection
                    icon={CalendarDays}
                    title="Periode Pendaftaran"
                    description="Tentukan periode utama penerimaan siswa baru."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Tanggal Mulai"
                        type="date"
                        value="2026-08-01"
                      />

                      <Input
                        label="Tanggal Selesai"
                        type="date"
                        value="2026-10-31"
                      />
                    </div>
                  </SettingSection>

                  {/* KUOTA */}

                  <SettingSection
                    icon={Users}
                    title="Kuota Penerimaan"
                    description="Atur kapasitas penerimaan siswa berdasarkan program."
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Input
                        label="Total Kuota"
                        value="400"
                        suffix="siswa"
                      />

                      <Input
                        label="IPA"
                        value="150"
                        suffix="siswa"
                      />

                      <Input
                        label="IPS"
                        value="100"
                        suffix="siswa"
                      />

                      <Input
                        label="Teknik"
                        value="100"
                        suffix="siswa"
                      />

                      <Input
                        label="Lainnya"
                        value="50"
                        suffix="siswa"
                      />
                    </div>
                  </SettingSection>

                  {/* PERSYARATAN */}

                  <SettingSection
                    icon={FileText}
                    title="Persyaratan Pendaftaran"
                    description="Dokumen yang wajib dilengkapi oleh calon siswa."
                  >
                    <div className="space-y-2">
                      {[
                        "Kartu Keluarga",
                        "Akta Kelahiran",
                        "Ijazah / Surat Keterangan Lulus",
                        "Kartu Indonesia Pintar",
                        "Pas Foto",
                        "Dokumen Pendukung Lainnya",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`flex items-center justify-between rounded-lg border ${themeNeutralBorder} px-3 py-3 transition-colors ${themeNeutralHover}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-md ${themePrimarySoft} text-[10px] font-bold ${themePrimaryText}`}
                            >
                              {index + 1}
                            </span>

                            <span className="theme-text text-xs font-medium">
                              {item}
                            </span>
                          </div>

                          <CheckCircle2
                            size={16}
                            className="text-[var(--color-success)]"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${themePrimaryText} transition-opacity hover:opacity-80`}
                    >
                      Kelola Persyaratan
                      <ChevronRight size={14} />
                    </button>
                  </SettingSection>

                  {/* JURUSAN */}

                  <SettingSection
                    icon={GraduationCap}
                    title="Program / Jurusan"
                    description="Program pendidikan yang dapat dipilih calon siswa."
                  >
                    <div className="space-y-2">
                      <Program
                        name="IPA"
                        quota="150 siswa"
                        active
                      />

                      <Program
                        name="IPS"
                        quota="100 siswa"
                        active
                      />

                      <Program
                        name="Teknik"
                        quota="100 siswa"
                        active
                      />
                    </div>

                    <button
                      type="button"
                      className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${themePrimaryText} transition-opacity hover:opacity-80`}
                    >
                      Kelola Program
                      <ChevronRight size={14} />
                    </button>
                  </SettingSection>
                </div>

                {/* ================================================= */}
                {/* RIGHT */}
                {/* ================================================= */}

                <div className="space-y-4">
                  {/* STATUS */}

                  <div
                    className={`theme-card rounded-xl border ${themePrimarySoftBorder} p-5 ${themeCardShadow}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft}`}
                      >
                        <ClipboardCheck
                          size={18}
                          className={themePrimaryText}
                        />
                      </div>

                      <div>
                        <h2 className="theme-text text-sm font-bold">
                          Status SPMB
                        </h2>

                        <p className="theme-text-muted text-[10px]">
                          Status sistem saat ini
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-5 rounded-lg ${themeSuccessSurface} ${themeSuccessBorder} border p-3`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              "var(--color-success)",
                          }}
                        />

                        <span className="text-[var(--color-success)] text-xs font-semibold">
                          Pendaftaran Aktif
                        </span>
                      </div>

                      <p className="mt-1 text-[var(--color-success)] text-[10px]">
                        Sistem menerima pendaftaran siswa baru.
                      </p>
                    </div>
                  </div>

                  {/* SYSTEM */}

                  <div
                    className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                  >
                    <div className="mb-4">
                      <h2 className="theme-text text-sm font-bold">
                        Konfigurasi Sistem
                      </h2>

                      <p className="theme-text-muted mt-0.5 text-[10px]">
                        Atur perilaku sistem SPMB
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Toggle
                        label="Pendaftaran Online"
                        description="Calon siswa dapat melakukan pendaftaran"
                        active={settings.pendaftaran}
                        onClick={() =>
                          toggle("pendaftaran")
                        }
                      />

                      <Toggle
                        label="Verifikasi Berkas"
                        description="Aktifkan pemeriksaan berkas"
                        active={settings.verifikasi}
                        onClick={() =>
                          toggle("verifikasi")
                        }
                      />

                      <Toggle
                        label="Pembayaran"
                        description="Aktifkan proses pembayaran"
                        active={settings.pembayaran}
                        onClick={() =>
                          toggle("pembayaran")
                        }
                      />

                      <Toggle
                        label="Nomor Otomatis"
                        description="Generate nomor pendaftaran otomatis"
                        active={settings.autoNumber}
                        onClick={() =>
                          toggle("autoNumber")
                        }
                      />

                      <Toggle
                        label="Notifikasi Email"
                        description="Kirim pemberitahuan melalui email"
                        active={
                          settings.emailNotification
                        }
                        onClick={() =>
                          toggle(
                            "emailNotification"
                          )
                        }
                      />

                      <Toggle
                        label="Notifikasi WhatsApp"
                        description="Kirim pemberitahuan melalui WhatsApp"
                        active={
                          settings.whatsappNotification
                        }
                        onClick={() =>
                          toggle(
                            "whatsappNotification"
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* GENERAL */}

                  <div
                    className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                  >
                    <h2 className="theme-text text-sm font-bold">
                      Informasi Pendaftaran
                    </h2>

                    <div className="mt-4 space-y-3">
                      <Input
                        label="Tahun Ajaran"
                        value="2026/2027"
                      />

                      <Input
                        label="Nama Penerimaan"
                        value="SPMB Tahun Ajaran 2026/2027"
                      />

                      <Input
                        label="Kontak Panitia"
                        value="021-12345678"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* SAVE */}
              {/* ================================================= */}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-lg ${themePrimaryGradient} px-5 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:opacity-90 active:scale-[0.98]`}
                >
                  <Save size={15} />
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// SETTING SECTION
// =========================================================

function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section
      className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft}`}
        >
          <Icon
            size={17}
            className={themePrimaryText}
          />
        </div>

        <div>
          <h2 className="theme-text text-sm font-bold">
            {title}
          </h2>

          <p className="theme-text-muted text-[10px]">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

// =========================================================
// INPUT
// =========================================================

function Input({
  label,
  type = "text",
  value,
  suffix,
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-[10px] font-semibold">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          defaultValue={value}
          className={`theme-input h-10 w-full rounded-lg border px-3 text-xs font-medium outline-none transition-colors ${themeFocus} ${
            suffix ? "pr-14" : ""
          }`}
        />

        {suffix && (
          <span className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// =========================================================
// PROGRAM
// =========================================================

function Program({
  name,
  quota,
  active,
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border ${themeNeutralBorder} p-3 transition-colors ${themeNeutralHover}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${themePrimarySoft}`}
        >
          <GraduationCap
            size={15}
            className={themePrimaryText}
          />
        </div>

        <div>
          <p className="theme-text text-xs font-semibold">
            {name}
          </p>

          <p className="theme-text-muted text-[10px]">
            {quota}
          </p>
        </div>
      </div>

      <span
        className={`rounded-md border px-2 py-1 text-[9px] font-semibold ${
          active
            ? `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
            : `${themeNeutralSurface} ${themeNeutralBorder} theme-text-secondary`
        }`}
      >
        {active ? "Aktif" : "Nonaktif"}
      </span>
    </div>
  );
}

// =========================================================
// TOGGLE
// =========================================================

function Toggle({
  label,
  description,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${themeNeutralHover}`}
    >
      <div className="min-w-0 pr-3">
        <p className="theme-text text-xs font-semibold">
          {label}
        </p>

        <p className="theme-text-muted mt-0.5 text-[10px]">
          {description}
        </p>
      </div>

      {active ? (
        <ToggleRight
          size={25}
          className={`shrink-0 ${themePrimaryText}`}
        />
      ) : (
        <ToggleLeft
          size={25}
          className="theme-text-placeholder shrink-0"
        />
      )}
    </button>
  );
}