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

  return `${String(finalHour).padStart(2, "0")}:${String(finalMinute).padStart(2, "0")}`;
}

// =========================================================
// PAGE
// =========================================================

export default function TambahMasterShiftPage() {
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);

  const lateLimit = calculateLateLimit(form.startTime, form.tolerance);

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
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFC]">
          {/* CONTAINER FULL WIDTH */}
          <div className="w-full px-6 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() => router.push("/admin/presensi/master-shift")}
              className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] transition-colors hover:text-[#0F172A]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#60A5FA]/30 bg-white transition-colors hover:border-[#2563EB]">
                <ArrowLeft size={14} />
              </span>
              Kembali ke Master Shift
            </button>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                  <Clock3 size={20} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                      Master Shift
                    </p>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[28px]">
                    Tambah Shift Baru
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
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
                  <section className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                        <Clock3 size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">
                          Informasi Shift
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Masukkan identitas dan jadwal shift.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 2xl:p-6">

                      {/* NAMA */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Nama Shift <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="Contoh: Shift Pagi"
                          className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                        />
                      </div>

                      {/* KODE */}
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Kode Shift <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={form.code}
                          onChange={(e) =>
                            setForm({ ...form, code: e.target.value.toUpperCase() })
                          }
                          placeholder="SHIFT-PAGI"
                          className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 text-sm uppercase text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                        />
                      </div>

                      {/* STATUS */}
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Status
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) =>
                            setForm({ ...form, status: e.target.value })
                          }
                          className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 text-sm font-medium text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Nonaktif">Nonaktif</option>
                        </select>
                      </div>

                      {/* JAM MASUK */}
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Jam Masuk <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(e) =>
                            setForm({ ...form, startTime: e.target.value })
                          }
                          className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                        />
                      </div>

                      {/* JAM PULANG */}
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Jam Pulang <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) =>
                            setForm({ ...form, endTime: e.target.value })
                          }
                          className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                        />
                      </div>

                      {/* TOLERANSI */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Toleransi Keterlambatan
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={form.tolerance}
                            onChange={(e) =>
                              setForm({ ...form, tolerance: e.target.value })
                            }
                            className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 pr-20 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                            menit
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-400">
                          Contoh: jam masuk 07:00, toleransi 15 menit → batas telat 07:15.
                        </p>
                      </div>

                      {/* DESKRIPSI */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Deskripsi
                        </label>
                        <textarea
                          rows={4}
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          placeholder="Masukkan keterangan shift..."
                          className="w-full resize-none rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                        />
                      </div>
                    </div>
                  </section>

                  {/* BERLAKU UNTUK */}
                  <section className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                        <UserRound size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">
                          Berlaku Untuk
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Tentukan kategori pengguna yang menggunakan shift ini.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3 2xl:p-6">
                      {categories.map((item) => {
                        const Icon = item.icon;
                        const selected = form.appliesTo.includes(item.value);

                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => toggleCategory(item.value)}
                            className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                              selected
                                ? "border-[#2563EB]/60 bg-[#2563EB]/5"
                                : "border-[#60A5FA]/20 bg-white hover:border-[#2563EB]/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                                  selected
                                    ? "border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]"
                                    : "border-slate-200 bg-[#F8FAFC] text-slate-500"
                                }`}
                              >
                                <Icon size={18} />
                              </div>

                              {selected && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white">
                                  <CheckCircle2 size={14} />
                                </div>
                              )}
                            </div>

                            <p className="mt-3 text-sm font-bold text-[#0F172A]">
                              {item.label}
                            </p>

                            <p className="mt-1 text-[11px] leading-4 text-slate-500">
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
                  <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                        <Info size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">
                          Preview Aturan Presensi
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
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
                      <div className="pt-4 border-t border-[#60A5FA]/15">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Status Presensi
                          </p>
                        </div>

                        <div className="space-y-2">
                          <StatusRow
                            label="Hadir"
                            text="Sampai sebelum batas toleransi"
                            dot="bg-emerald-500"
                          />
                          <StatusRow
                            label="Telat"
                            text="Melewati batas toleransi"
                            dot="bg-amber-500"
                          />
                          <StatusRow
                            label="Izin"
                            text="Pengajuan izin disetujui"
                            dot="bg-[#2563EB]"
                          />
                          <StatusRow
                            label="Cuti"
                            text="Data cuti disetujui"
                            dot="bg-violet-500"
                          />
                          <StatusRow
                            label="Alpha"
                            text="Tidak ada presensi/izin"
                            dot="bg-red-500"
                          />
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="rounded-lg border border-[#60A5FA]/25 bg-[#2563EB]/5 p-3.5">
                        <div className="flex gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-white text-[#2563EB]">
                            <CircleAlert size={13} />
                          </div>
                          <p className="text-[11px] leading-5 text-[#1E3A5F]/80">
                            Shift ini akan menjadi acuan jam masuk dan jam pulang
                            pada proses presensi.
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
                  onClick={() => router.push("/admin/presensi/master-shift")}
                  className="h-11 rounded-lg border border-[#60A5FA]/30 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A5F]"
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

function PreviewRow({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[#2563EB] flex-shrink-0">{icon}</span>
        <span className="text-xs text-slate-500 truncate">{label}</span>
      </div>
      <span
        className={`text-sm font-bold flex-shrink-0 ${
          highlight ? "text-[#2563EB]" : "text-[#0F172A]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusRow({ label, text, dot }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#60A5FA]/15 bg-[#F8FAFC] p-3 transition-colors hover:border-[#2563EB]/30">
      <span className={`mt-1 w-2 h-2 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#0F172A]">{label}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#60A5FA]/15" />;
}