"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  ArrowLeft,
  Clock3,
  CircleAlert,
  CheckCircle2,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
  Sun,
  Moon,
  AlertCircle,
  Info,
  Save,
} from "lucide-react";

// =========================================================
// FORM
// =========================================================

const emptyForm = {
  name: "",
  code: "",
  startTime: "",
  endTime: "",
  tolerance: "15",
  status: "Aktif",
  appliesTo: [],
  description: "",
};

const categories = [
  {
    value: "Guru",
    label: "Guru",
    description: "Guru dan tenaga pendidik",
    icon: GraduationCap,
    tone: "blue",
  },
  {
    value: "Staff",
    label: "Staff",
    description: "Staff dan tenaga kependidikan",
    icon: BriefcaseBusiness,
    tone: "violet",
  },
  {
    value: "Siswa",
    label: "Siswa",
    description: "Peserta didik",
    icon: UserRound,
    tone: "slate",
  },
];

// =========================================================
// HELPERS
// =========================================================

function calculateLateLimit(startTime, tolerance) {
  if (!startTime || tolerance === "") return "--:--";

  const [hour, minute] = startTime.split(":").map(Number);
  const total = hour * 60 + minute + Number(tolerance);

  const finalHour = Math.floor(total / 60) % 24;
  const finalMinute = total % 60;

  return `${String(finalHour).padStart(2, "0")}:${String(
    finalMinute
  ).padStart(2, "0")}`;
}

// =========================================================
// PAGE
// =========================================================

export default function TambahMasterShiftPage() {
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);

  const lateLimit = calculateLateLimit(
    form.startTime,
    form.tolerance
  );

  const toggleCategory = (category) => {
    setForm((current) => ({
      ...current,
      appliesTo: current.appliesTo.includes(category)
        ? current.appliesTo.filter((item) => item !== category)
        : [...current.appliesTo, category],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !form.startTime ||
      !form.endTime ||
      form.tolerance === ""
    ) {
      alert("Mohon lengkapi seluruh data shift.");
      return;
    }

    if (form.appliesTo.length === 0) {
      alert("Pilih minimal satu pengguna yang menggunakan shift.");
      return;
    }

    const tolerance = Number(form.tolerance);

    if (Number.isNaN(tolerance) || tolerance < 0) {
      alert("Toleransi keterlambatan harus berupa angka yang valid.");
      return;
    }

    if (form.startTime >= form.endTime) {
      alert("Jam pulang harus lebih besar dari jam masuk.");
      return;
    }

    // =====================================================
    // NANTI DI SINI POST KE BE
    // POST /api/v1/shifts
    // =====================================================

    alert("Shift berhasil ditambahkan.");
    router.push("/admin/presensi/master-shift");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page theme-text">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto theme-page">
          <div className="w-full px-6 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                router.push("/admin/presensi/master-shift")
              }
              className="theme-text-secondary mb-5 inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[var(--color-primary)]"
            >
              <span className="theme-card theme-border flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-[var(--color-primary)]">
                <ArrowLeft size={14} />
              </span>

              Kembali ke Master Shift
            </button>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <Clock3 size={20} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="theme-primary h-1.5 w-1.5 rounded-full" />

                    <p className="theme-sidebar-text-active text-[11px] font-bold uppercase tracking-[0.12em]">
                      Master Shift
                    </p>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-[28px]">
                    Tambah Shift Baru
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm">
                    Tambahkan jadwal kerja dan aturan presensi baru.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-6 2xl:gap-7">

                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="space-y-5 2xl:space-y-6">

                  {/* INFORMASI SHIFT */}

                  <section className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-4">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg border">
                        <Clock3 size={15} />
                      </div>

                      <div>
                        <p className="theme-text text-sm font-bold">
                          Informasi Shift
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[11px]">
                          Masukkan identitas dan jadwal shift.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 2xl:p-6">

                      {/* NAMA */}

                      <div className="md:col-span-2">
                        <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
                          Nama Shift{" "}
                          <span className="text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <input
                          value={form.name}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              name: e.target.value,
                            })
                          }
                          placeholder="Contoh: Shift Pagi"
                          className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                        />
                      </div>

                      {/* KODE */}

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
                          Kode Shift{" "}
                          <span className="text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <input
                          value={form.code}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="SHIFT-PAGI"
                          className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                        />
                      </div>

                      {/* STATUS */}

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
                          Status
                        </label>

                        <select
                          value={form.status}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              status: e.target.value,
                            })
                          }
                          className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Nonaktif">
                            Nonaktif
                          </option>
                        </select>
                      </div>

                      {/* JAM MASUK */}

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
                          Jam Masuk{" "}
                          <span className="text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              startTime: e.target.value,
                            })
                          }
                          className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                        />
                      </div>

                      {/* JAM PULANG */}

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
                          Jam Pulang{" "}
                          <span className="text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              endTime: e.target.value,
                            })
                          }
                          className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                        />
                      </div>

                      {/* TOLERANSI */}

                      <div className="md:col-span-2">
                        <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
                          Toleransi Keterlambatan
                        </label>

                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={form.tolerance}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                tolerance: e.target.value,
                              })
                            }
                            className="theme-input h-11 w-full rounded-lg border px-3.5 pr-20 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                          />

                          <span className="theme-text-placeholder absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold">
                            menit
                          </span>
                        </div>

                        <p className="theme-text-placeholder mt-1.5 text-[11px]">
                          Contoh: jam masuk 07:00, toleransi 15 menit
                          → batas telat 07:15.
                        </p>
                      </div>

                      {/* DESKRIPSI */}

                      <div className="md:col-span-2">
                        <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
                          Deskripsi
                        </label>

                        <textarea
                          rows={4}
                          value={form.description}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              description: e.target.value,
                            })
                          }
                          placeholder="Masukkan keterangan shift..."
                          className="theme-input w-full resize-none rounded-lg border px-3.5 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                        />
                      </div>
                    </div>
                  </section>

                  {/* BERLAKU UNTUK */}

                  <section className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-4">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg border">
                        <UserRound size={15} />
                      </div>

                      <div>
                        <p className="theme-text text-sm font-bold">
                          Berlaku Untuk
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[11px]">
                          Tentukan kategori pengguna yang menggunakan
                          shift ini.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3 2xl:p-6">
                      {categories.map((item) => {
                        const Icon = item.icon;
                        const selected =
                          form.appliesTo.includes(item.value);

                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() =>
                              toggleCategory(item.value)
                            }
                            className={`theme-card relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                              selected
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                : "theme-border hover:border-[var(--color-primary)]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                                  selected
                                    ? "theme-info"
                                    : "theme-card-soft theme-text-muted theme-border"
                                }`}
                              >
                                <Icon size={18} />
                              </div>

                              {selected && (
                                <div className="theme-primary flex h-6 w-6 items-center justify-center rounded-full">
                                  <CheckCircle2 size={14} />
                                </div>
                              )}
                            </div>

                            <p className="theme-text mt-3 text-sm font-bold">
                              {item.label}
                            </p>

                            <p className="theme-text-muted mt-1 text-[11px] leading-4">
                              {item.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* =================================================
                    RIGHT COLUMN — PREVIEW
                ================================================= */}

                <aside className="xl:sticky xl:top-6">
                  <div className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-4">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg border">
                        <Info size={15} />
                      </div>

                      <div>
                        <p className="theme-text text-sm font-bold">
                          Preview Aturan Presensi
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[11px]">
                          Ringkasan aturan yang akan berlaku.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">

                      {/* JAM MASUK */}

                      <PreviewRow
                        icon={<Sun size={14} />}
                        label="Jam Masuk"
                        value={form.startTime || "--:--"}
                      />

                      <Divider />

                      {/* JAM PULANG */}

                      <PreviewRow
                        icon={<Moon size={14} />}
                        label="Jam Pulang"
                        value={form.endTime || "--:--"}
                      />

                      <Divider />

                      {/* TOLERANSI */}

                      <PreviewRow
                        icon={<Clock3 size={14} />}
                        label="Toleransi"
                        value={`${form.tolerance || 0} menit`}
                      />

                      <Divider />

                      {/* BATAS TELAT */}

                      <PreviewRow
                        icon={<AlertCircle size={14} />}
                        label="Batas Telat"
                        value={lateLimit}
                        highlight
                      />

                      {/* STATUS PRESENSI */}

                      <div className="theme-border border-t pt-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="theme-primary h-1 w-1 rounded-full" />

                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                            Status Presensi
                          </p>
                        </div>

                        <div className="space-y-2">
                          <StatusRow
                            label="Hadir"
                            text="Sampai sebelum batas toleransi"
                            status="success"
                          />

                          <StatusRow
                            label="Telat"
                            text="Melewati batas toleransi"
                            status="warning"
                          />

                          <StatusRow
                            label="Izin"
                            text="Pengajuan izin disetujui"
                            status="info"
                          />

                          <StatusRow
                            label="Cuti"
                            text="Data cuti disetujui"
                            status="purple"
                          />

                          <StatusRow
                            label="Alpha"
                            text="Tidak ada presensi/izin"
                            status="danger"
                          />
                        </div>
                      </div>

                      {/* INFO */}

                      <div className="theme-info rounded-lg border p-3.5">
                        <div className="flex gap-3">
                          <div className="theme-card flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border">
                            <CircleAlert
                              size={13}
                              className="theme-sidebar-text-active"
                            />
                          </div>

                          <p className="theme-text-secondary text-[11px] leading-5">
                            Shift ini akan menjadi acuan jam masuk
                            dan jam pulang pada proses presensi.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/presensi/master-shift"
                    )
                  }
                  className="theme-card theme-border theme-text-secondary h-11 rounded-lg border px-5 text-sm font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-colors"
                >
                  <Save size={15} />
                  Simpan Shift
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// SUB COMPONENTS
// =========================================================

function PreviewRow({
  icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="theme-sidebar-text-active shrink-0">
          {icon}
        </span>

        <span className="theme-text-muted truncate text-xs">
          {label}
        </span>
      </div>

      <span
        className={`shrink-0 text-sm font-bold ${
          highlight
            ? "theme-sidebar-text-active"
            : "theme-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusRow({
  label,
  text,
  status,
}) {
  const statusClasses = {
    success:
      "theme-success",
    warning:
      "theme-warning",
    info:
      "theme-info",
    purple:
      "theme-card-soft theme-text-secondary theme-border",
    danger:
      "theme-danger",
  };

  const dotClasses = {
    success:
      "bg-[var(--color-success)]",
    warning:
      "bg-[var(--color-warning)]",
    info:
      "bg-[var(--color-info)]",
    purple:
      "bg-[var(--color-text-muted)]",
    danger:
      "bg-[var(--color-danger)]",
  };

  return (
    <div
      className={`theme-border flex items-start gap-3 rounded-lg border p-3 transition-colors hover:border-[var(--color-primary)] ${
        statusClasses[status] || "theme-card-soft"
      }`}
    >
      <span
        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
          dotClasses[status] || "bg-[var(--color-text-muted)]"
        }`}
      />

      <div className="min-w-0">
        <p className="theme-text text-xs font-bold">
          {label}
        </p>

        <p className="theme-text-muted mt-0.5 text-[11px] leading-4">
          {text}
        </p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="theme-border h-px border-t" />;
}