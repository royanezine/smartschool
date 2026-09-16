"use client";

import { useState } from "react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
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
            {/* HEADER */}

            <div className="mb-5 flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ff]">
                <Settings2
                  size={20}
                  className="text-[#155DFC]"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Pengaturan SPMB
                </h1>

                <p className="text-xs text-slate-500">
                  Kelola konfigurasi sistem penerimaan siswa baru
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="grid gap-4 xl:grid-cols-3">
                {/* LEFT */}

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
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eaf1ff] text-[10px] font-bold text-[#155DFC]">
                              {index + 1}
                            </span>

                            <span className="text-xs font-medium text-slate-700">
                              {item}
                            </span>
                          </div>

                          <CheckCircle2
                            size={16}
                            className="text-emerald-500"
                          />
                        </div>
                      ))}
                    </div>

                    <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#155DFC]">
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

                    <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#155DFC]">
                      Kelola Program
                      <ChevronRight size={14} />
                    </button>
                  </SettingSection>
                </div>

                {/* RIGHT */}

                <div className="space-y-4">
                  {/* STATUS */}

                  <div className="rounded-xl border border-[#c7dbff] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf1ff]">
                        <ClipboardCheck
                          size={18}
                          className="text-[#155DFC]"
                        />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          Status SPMB
                        </h2>

                        <p className="text-[10px] text-slate-400">
                          Status sistem saat ini
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-lg bg-emerald-50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        <span className="text-xs font-semibold text-emerald-700">
                          Pendaftaran Aktif
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-emerald-600">
                        Sistem menerima pendaftaran siswa baru.
                      </p>
                    </div>
                  </div>

                  {/* SYSTEM */}

                  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h2 className="text-sm font-bold text-slate-800">
                        Konfigurasi Sistem
                      </h2>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Atur perilaku sistem SPMB
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Toggle
                        label="Pendaftaran Online"
                        description="Calon siswa dapat melakukan pendaftaran"
                        active={
                          settings.pendaftaran
                        }
                        onClick={() =>
                          toggle("pendaftaran")
                        }
                      />

                      <Toggle
                        label="Verifikasi Berkas"
                        description="Aktifkan pemeriksaan berkas"
                        active={
                          settings.verifikasi
                        }
                        onClick={() =>
                          toggle("verifikasi")
                        }
                      />

                      <Toggle
                        label="Pembayaran"
                        description="Aktifkan proses pembayaran"
                        active={
                          settings.pembayaran
                        }
                        onClick={() =>
                          toggle("pembayaran")
                        }
                      />

                      <Toggle
                        label="Nomor Otomatis"
                        description="Generate nomor pendaftaran otomatis"
                        active={
                          settings.autoNumber
                        }
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

                  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-800">
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

              {/* SAVE */}

              <div className="mt-5 flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0d47c9]">
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

function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1ff]">
          <Icon
            size={17}
            className="text-[#155DFC]"
          />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {title}
          </h2>

          <p className="text-[10px] text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Input({
  label,
  type = "text",
  value,
  suffix,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          defaultValue={value}
          className={`h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#8bb4ff] focus:bg-white focus:ring-2 focus:ring-[#155DFC]/10 ${
            suffix ? "pr-14" : ""
          }`}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Program({
  name,
  quota,
  active,
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf1ff]">
          <GraduationCap
            size={15}
            className="text-[#155DFC]"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700">
            {name}
          </p>

          <p className="text-[10px] text-slate-400">
            {quota}
          </p>
        </div>
      </div>

      <span
        className={`rounded-md px-2 py-1 text-[9px] font-semibold ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {active ? "Aktif" : "Nonaktif"}
      </span>
    </div>
  );
}

function Toggle({
  label,
  description,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg p-3 text-left transition hover:bg-slate-50"
    >
      <div className="min-w-0 pr-3">
        <p className="text-xs font-semibold text-slate-700">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          {description}
        </p>
      </div>

      {active ? (
        <ToggleRight
          size={25}
          className="shrink-0 text-[#155DFC]"
        />
      ) : (
        <ToggleLeft
          size={25}
          className="shrink-0 text-slate-300"
        />
      )}
    </button>
  );
}