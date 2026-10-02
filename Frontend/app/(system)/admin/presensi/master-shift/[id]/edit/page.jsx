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

  const total = hour * 60 + minute + Number(tolerance || 0);

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
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <main className="flex flex-1 items-center justify-center theme-page">
            <div className="text-center">
              <Clock3
                size={40}
                className="mx-auto theme-text-placeholder"
              />

              <h1 className="mt-4 text-lg font-bold theme-text">
                Shift tidak ditemukan
              </h1>

              <button
                type="button"
                onClick={() =>
                  router.push("/admin/presensi/master-shift")
                }
                className="mt-5 rounded-lg theme-primary px-5 py-2.5 text-sm font-semibold"
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

    

    alert("Perubahan shift berhasil disimpan.");

    router.push(`/master-shift/${shift.id}`);
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-[1100px] px-6 py-6 md:px-8 md:py-8">

            {/* BACK */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/presensi/master-shift/${shift.id}`
                )
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium theme-text-muted transition-colors hover:theme-sidebar-text-active"
            >
              <ArrowLeft size={17} />
              Kembali ke Detail Shift
            </button>

            {/* PAGE HEADER */}

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border theme-border theme-info">
                <Clock3 size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Edit Shift
                </h1>

                <p className="mt-1 text-sm theme-text-muted">
                  Perbarui jadwal dan aturan presensi shift.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* FORM */}

                <div className="space-y-6 lg:col-span-2">

                  {/* INFORMASI SHIFT */}

                  <section className="theme-card rounded-xl border theme-border shadow-sm">
                    <div className="border-b theme-border px-6 py-5 theme-card-soft">
                      <h2 className="font-semibold theme-text">
                        Informasi Shift
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                      {/* NAMA SHIFT */}

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold theme-text">
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
                          className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                        />
                      </div>

                      {/* KODE SHIFT */}

                      <div>
                        <label className="mb-2 block text-sm font-semibold theme-text">
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
                          className="theme-input h-11 w-full rounded-lg border px-3 text-sm uppercase outline-none transition-colors focus:border-[var(--color-primary)]"
                        />
                      </div>

                      {/* STATUS */}

                      <div>
                        <label className="mb-2 block text-sm font-semibold theme-text">
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
                          className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                        >
                          <option value="Aktif">
                            Aktif
                          </option>

                          <option value="Nonaktif">
                            Nonaktif
                          </option>
                        </select>
                      </div>

                      {/* JAM MASUK */}

                      <div>
                        <label className="mb-2 block text-sm font-semibold theme-text">
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
                          className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                        />
                      </div>

                      {/* JAM PULANG */}

                      <div>
                        <label className="mb-2 block text-sm font-semibold theme-text">
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
                          className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                        />
                      </div>

                      {/* TOLERANSI */}

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold theme-text">
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
                            className="theme-input h-11 w-full rounded-lg border px-3 pr-20 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm theme-text-muted">
                            menit
                          </span>
                        </div>
                      </div>

                      {/* DESKRIPSI */}

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold theme-text">
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
                          className="theme-input w-full resize-none rounded-lg border px-3 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                        />
                      </div>
                    </div>
                  </section>

                  {/* CATEGORY */}

                  <section className="theme-card rounded-xl border theme-border shadow-sm">
                    <div className="border-b theme-border px-6 py-5 theme-card-soft">
                      <h2 className="font-semibold theme-text">
                        Berlaku Untuk
                      </h2>

                      <p className="mt-1 text-xs theme-text-muted">
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
                            className={`rounded-xl border p-4 text-left transition-colors ${
                              selected
                                ? "border-[var(--color-primary)] theme-info"
                                : "theme-border theme-card-soft hover:border-[var(--color-primary)]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg border theme-border theme-card text-[var(--color-primary)]">
                                <Icon size={19} />
                              </div>

                              {selected && (
                                <CheckCircle2
                                  size={18}
                                  className="text-[var(--color-primary)]"
                                />
                              )}
                            </div>

                            <p className="mt-3 text-sm font-semibold theme-text">
                              {item.label}
                            </p>

                            <p className="mt-1 text-xs theme-text-muted">
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
                  <div className="theme-card sticky top-6 rounded-xl border theme-border shadow-sm">
                    <div className="border-b theme-border px-5 py-5 theme-card-soft">
                      <h2 className="font-semibold theme-text">
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

                      <div className="theme-info rounded-lg border p-4">
                        <div className="flex gap-3">
                          <CircleAlert
                            size={18}
                            className="mt-0.5 shrink-0"
                          />

                          <p className="text-xs leading-5">
                            Perubahan jadwal akan menjadi acuan
                            presensi setelah disimpan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/master-shift/${shift.id}`)
                  }
                  className="h-11 rounded-lg border theme-border theme-card px-5 text-sm font-semibold theme-text-secondary transition-colors hover:theme-card-soft"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="theme-primary h-11 rounded-lg px-6 text-sm font-semibold"
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
      <span className="text-xs theme-text-muted">
        {label}
      </span>

      <span className="text-sm font-bold theme-text">
        {value || "--:--"}
      </span>
    </div>
  );
}