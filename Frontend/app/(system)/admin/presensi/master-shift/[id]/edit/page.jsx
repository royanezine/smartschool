"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  ArrowLeft,
  Clock3,
  CircleAlert,
  CheckCircle2,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
} from "lucide-react";

const initialShift = {
  id: 1,
  name: "Shift Pagi",
  code: "SHIFT-PAGI",
  startTime: "07:00",
  endTime: "15:00",
  tolerance: 15,
  status: "Aktif",
  appliesTo: ["Guru", "Staff", "Siswa"],
  description:
    "Shift pagi untuk guru, staff, dan siswa yang mengikuti kegiatan sekolah pada pagi hari.",
};

const categories = [
  {
    value: "Guru",
    label: "Guru",
    description: "Guru dan tenaga pendidik",
    icon: GraduationCap,
  },
  {
    value: "Staff",
    label: "Staff",
    description: "Staff dan tenaga kependidikan",
    icon: BriefcaseBusiness,
  },
  {
    value: "Siswa",
    label: "Siswa",
    description: "Peserta didik",
    icon: UserRound,
  },
];

function getLateLimit(startTime, tolerance) {
  if (!startTime) return "--:--";

  const [hour, minute] = startTime.split(":").map(Number);

  const total =
    hour * 60 + minute + Number(tolerance || 0);

  const finalHour = Math.floor(total / 60) % 24;
  const finalMinute = total % 60;

  return `${String(finalHour).padStart(2, "0")}:${String(
    finalMinute
  ).padStart(2, "0")}`;
}

export default function EditMasterShiftPage() {
  const router = useRouter();
  const params = useParams();

  const shiftId = Number(params.id);

  // Dummy sementara.
  // Nanti diganti GET /api/v1/shifts/:id
  const shift =
    shiftId === initialShift.id ? initialShift : null;

  const [form, setForm] = useState(
    shift
      ? {
          name: shift.name,
          code: shift.code,
          startTime: shift.startTime,
          endTime: shift.endTime,
          tolerance: String(shift.tolerance),
          status: shift.status,
          appliesTo: shift.appliesTo,
          description: shift.description,
        }
      : null
  );

  if (!shift || !form) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Clock3
                size={40}
                className="mx-auto text-slate-300"
              />

              <h1 className="mt-4 text-lg font-bold">
                Shift tidak ditemukan
              </h1>

              <button
                type="button"
                onClick={() => router.push("/admin/presensi/master-shift")}
                className="mt-5 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Kembali
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const lateLimit = getLateLimit(
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
      alert("Pilih minimal satu pengguna.");
      return;
    }

    const tolerance = Number(form.tolerance);

    if (Number.isNaN(tolerance) || tolerance < 0) {
      alert("Toleransi harus berupa angka yang valid.");
      return;
    }

    if (form.startTime >= form.endTime) {
      alert("Jam pulang harus lebih besar dari jam masuk.");
      return;
    }

    // =====================================================
    // NANTI DI SINI PUT/PATCH KE BE
    // PATCH /api/v1/shifts/:id
    // =====================================================

    alert("Perubahan shift berhasil disimpan.");

    router.push(`/master-shift/${shift.id}`);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-[#0F172A]">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto bg-white">
          <div className="mx-auto w-full max-w-[1100px] px-6 py-6 md:px-8 md:py-8">

            <button
              type="button"
              onClick={() =>
                router.push(`/admin/presensi/master-shift/${shift.id}`)
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#2563EB]"
            >
              <ArrowLeft size={17} />
              Kembali ke Detail Shift
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#2563EB]">
                <Clock3 size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Edit Shift
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Perbarui jadwal dan aturan presensi shift.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* FORM */}
                <div className="space-y-6 lg:col-span-2">

                  <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h2 className="font-semibold">
                        Informasi Shift
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">
                          Nama Shift
                        </label>

                        <input
                          value={form.name}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              name: event.target.value,
                            })
                          }
                          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Kode Shift
                        </label>

                        <input
                          value={form.code}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              code: event.target.value.toUpperCase(),
                            })
                          }
                          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm uppercase outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Status
                        </label>

                        <select
                          value={form.status}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              status: event.target.value,
                            })
                          }
                          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB]"
                        >
                          <option value="Aktif">
                            Aktif
                          </option>
                          <option value="Nonaktif">
                            Nonaktif
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Jam Masuk
                        </label>

                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              startTime: event.target.value,
                            })
                          }
                          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Jam Pulang
                        </label>

                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              endTime: event.target.value,
                            })
                          }
                          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">
                          Toleransi Keterlambatan
                        </label>

                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={form.tolerance}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                tolerance: event.target.value,
                              })
                            }
                            className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-20 text-sm outline-none focus:border-[#2563EB]"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            menit
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">
                          Deskripsi
                        </label>

                        <textarea
                          rows={4}
                          value={form.description}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              description: event.target.value,
                            })
                          }
                          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#2563EB]"
                        />
                      </div>
                    </div>
                  </section>

                  {/* CATEGORY */}
                  <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h2 className="font-semibold">
                        Berlaku Untuk
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Pilih pengguna yang menggunakan shift ini.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-3">
                      {categories.map((item) => {
                        const Icon = item.icon;
                        const selected =
                          form.appliesTo.includes(item.value);

                        return (
                          <button
                            type="button"
                            key={item.value}
                            onClick={() =>
                              toggleCategory(item.value)
                            }
                            className={`rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-[#2563EB] bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#2563EB]">
                                <Icon size={19} />
                              </div>

                              {selected && (
                                <CheckCircle2
                                  size={18}
                                  className="text-[#2563EB]"
                                />
                              )}
                            </div>

                            <p className="mt-3 text-sm font-semibold">
                              {item.label}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* PREVIEW */}
                <div>
                  <div className="sticky top-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5">
                      <h2 className="font-semibold">
                        Preview Perubahan
                      </h2>
                    </div>

                    <div className="space-y-4 p-5">
                      <PreviewRow
                        label="Jam Masuk"
                        value={form.startTime}
                      />

                      <PreviewRow
                        label="Jam Pulang"
                        value={form.endTime}
                      />

                      <PreviewRow
                        label="Toleransi"
                        value={`${form.tolerance} menit`}
                      />

                      <PreviewRow
                        label="Batas Telat"
                        value={lateLimit}
                      />

                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <div className="flex gap-3">
                          <CircleAlert
                            size={18}
                            className="mt-0.5 shrink-0 text-[#2563EB]"
                          />

                          <p className="text-xs leading-5 text-blue-800">
                            Perubahan jadwal akan menjadi acuan
                            presensi setelah disimpan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/master-shift/${shift.id}`)
                  }
                  className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-lg bg-[#2563EB] px-6 text-sm font-semibold text-white hover:bg-[#1E3A5F]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold">
        {value || "--:--"}
      </span>
    </div>
  );
}