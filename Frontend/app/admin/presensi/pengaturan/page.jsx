"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Info,
  MapPin,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

export default function PengaturanPresensiPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ============================================================
  // DUMMY NOTIFICATIONS
  // HARUS BERUPA ARRAY
  // ============================================================
  const notifications = [
    {
      id: 1,
      title: "Rekap presensi hari ini",
      desc: "Data presensi siswa telah diperbarui",
      read: false,
    },
    {
      id: 2,
      title: "Pengaturan presensi",
      desc: "Pengaturan presensi sekolah aktif",
      read: true,
    },
  ];

  // ============================================================
  // DUMMY DATA
  // ============================================================
  const [jamMasuk, setJamMasuk] = useState("07:00");
  const [jamPulang, setJamPulang] = useState("14:00");
  const [batasTerlambat, setBatasTerlambat] = useState("07:15");

  const [presensiMasuk, setPresensiMasuk] = useState(true);
  const [presensiPulang, setPresensiPulang] = useState(true);
  const [izinSakit, setIzinSakit] = useState(true);
  const [izinKeperluan, setIzinKeperluan] = useState(true);

  const [senin, setSenin] = useState(true);
  const [selasa, setSelasa] = useState(true);
  const [rabu, setRabu] = useState(true);
  const [kamis, setKamis] = useState(true);
  const [jumat, setJumat] = useState(true);
  const [sabtu, setSabtu] = useState(false);

  const [lokasiPresensi, setLokasiPresensi] = useState(true);
  const [radius, setRadius] = useState("100");

  const [saved, setSaved] = useState(false);

  // ============================================================
  // SAVE
  // ============================================================
  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}
      <Sidebar
        role="admin"
        active="pengaturanPresensi"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ========================================================
          MAIN AREA
      ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">
            {/* ==================================================
                HEADER PAGE
            ================================================== */}
            <div className="flex flex-col gap-5 mb-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/presensi")}
                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex-shrink-0 shadow-sm"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />

                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        Presensi & Kehadiran
                      </p>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      Pengaturan Presensi
                    </h1>

                    <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                      Atur jadwal, metode, dan ketentuan presensi yang
                      digunakan oleh sekolah.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className={`hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    saved
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {saved ? (
                    <>
                      <Check size={17} />
                      Tersimpan
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
              {/* ==================================================
                  LEFT CONTENT
              ================================================== */}
              <div className="space-y-6">
                {/* ================================================
                    JAM PRESENSI
                ================================================= */}
                <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <SectionHeader
                    icon={Clock3}
                    title="Jam Presensi"
                    description="Tentukan waktu masuk dan pulang sekolah."
                  />

                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <TimeInput
                        label="Jam Masuk"
                        value={jamMasuk}
                        onChange={setJamMasuk}
                      />

                      <TimeInput
                        label="Batas Keterlambatan"
                        value={batasTerlambat}
                        onChange={setBatasTerlambat}
                      />

                      <TimeInput
                        label="Jam Pulang"
                        value={jamPulang}
                        onChange={setJamPulang}
                      />
                    </div>

                    <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Info size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Ketentuan waktu
                        </p>

                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          Siswa yang melakukan presensi setelah pukul{" "}
                          <strong>{batasTerlambat}</strong> akan otomatis
                          tercatat sebagai terlambat.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ================================================
                    HARI AKTIF
                ================================================= */}
                <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <SectionHeader
                    icon={CalendarDays}
                    title="Hari Aktif"
                    description="Pilih hari sekolah yang menggunakan presensi."
                  />

                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <DayCard
                        label="Senin"
                        checked={senin}
                        onChange={setSenin}
                      />

                      <DayCard
                        label="Selasa"
                        checked={selasa}
                        onChange={setSelasa}
                      />

                      <DayCard
                        label="Rabu"
                        checked={rabu}
                        onChange={setRabu}
                      />

                      <DayCard
                        label="Kamis"
                        checked={kamis}
                        onChange={setKamis}
                      />

                      <DayCard
                        label="Jumat"
                        checked={jumat}
                        onChange={setJumat}
                      />

                      <DayCard
                        label="Sabtu"
                        checked={sabtu}
                        onChange={setSabtu}
                      />
                    </div>
                  </div>
                </section>

                {/* ================================================
                    JENIS PRESENSI
                ================================================= */}
                <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <SectionHeader
                    icon={Settings2}
                    title="Jenis Presensi"
                    description="Atur jenis aktivitas presensi yang tersedia."
                  />

                  <div className="p-5 sm:p-6">
                    <div className="divide-y divide-slate-100">
                      <ToggleRow
                        title="Presensi Masuk"
                        description="Siswa melakukan presensi saat datang ke sekolah."
                        checked={presensiMasuk}
                        onChange={setPresensiMasuk}
                      />

                      <ToggleRow
                        title="Presensi Pulang"
                        description="Siswa melakukan presensi saat selesai kegiatan sekolah."
                        checked={presensiPulang}
                        onChange={setPresensiPulang}
                      />

                      <ToggleRow
                        title="Pengajuan Sakit"
                        description="Siswa dapat mengajukan status sakit."
                        checked={izinSakit}
                        onChange={setIzinSakit}
                      />

                      <ToggleRow
                        title="Pengajuan Izin"
                        description="Siswa dapat mengajukan izin ke sekolah."
                        checked={izinKeperluan}
                        onChange={setIzinKeperluan}
                      />
                    </div>
                  </div>
                </section>

                {/* ================================================
                    LOKASI PRESENSI
                ================================================= */}
                <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <SectionHeader
                    icon={MapPin}
                    title="Lokasi Presensi"
                    description="Atur pembatasan lokasi ketika melakukan presensi."
                  />

                  <div className="p-5 sm:p-6">
                    <ToggleRow
                      title="Validasi Lokasi"
                      description="Presensi hanya dapat dilakukan dalam radius lokasi sekolah."
                      checked={lokasiPresensi}
                      onChange={setLokasiPresensi}
                    />

                    {lokasiPresensi && (
                      <div className="mt-5 pt-5 border-t border-slate-100">
                        <label className="text-sm font-semibold text-slate-700">
                          Radius Presensi
                        </label>

                        <div className="relative mt-2 max-w-sm">
                          <input
                            type="number"
                            min="10"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                            meter
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                          Contoh: siswa harus berada maksimal{" "}
                          <strong>{radius} meter</strong> dari lokasi sekolah.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* ==================================================
                  RIGHT SIDEBAR / INFO CARD
              ================================================== */}
              <aside className="space-y-5 xl:sticky xl:top-6">
                {/* SCHOOL CARD */}
                <div className="relative overflow-hidden rounded-2xl bg-[#155DFC] p-6 text-white shadow-lg">
                  <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-white/10" />
                  <div className="absolute -right-8 -bottom-16 w-32 h-32 rounded-full bg-white/10" />

                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mb-5">
                      <ShieldCheck size={21} />
                    </div>

                    <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                      Sistem Presensi
                    </p>

                    <h2 className="text-xl font-bold mt-1.5">
                      SMP SmartSchool
                    </h2>

                    <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                      Pengaturan presensi sekolah saat ini menggunakan
                      konfigurasi aktif.
                    </p>

                    <div className="mt-5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-300" />
                      <span className="text-xs font-medium text-blue-50">
                        Sistem aktif
                      </span>
                    </div>
                  </div>
                </div>

                {/* SUMMARY CARD */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users size={17} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Ringkasan Pengaturan
                        </h3>

                        <p className="text-xs text-slate-500 mt-0.5">
                          Konfigurasi saat ini
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-1">
                    <SummaryRow
                      label="Jam masuk"
                      value={jamMasuk}
                    />

                    <SummaryRow
                      label="Batas terlambat"
                      value={batasTerlambat}
                    />

                    <SummaryRow
                      label="Jam pulang"
                      value={jamPulang}
                    />

                    <SummaryRow
                      label="Hari aktif"
                      value={
                        [
                          senin,
                          selasa,
                          rabu,
                          kamis,
                          jumat,
                          sabtu,
                        ].filter(Boolean).length + " hari"
                      }
                    />

                    <SummaryRow
                      label="Validasi lokasi"
                      value={lokasiPresensi ? "Aktif" : "Nonaktif"}
                    />

                    {lokasiPresensi && (
                      <SummaryRow
                        label="Radius"
                        value={`${radius} m`}
                      />
                    )}
                  </div>
                </div>

                {/* TIPS CARD */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                      <RefreshCw size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Tips Pengaturan
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <TipItem text="Pastikan jam masuk sesuai jadwal sekolah." />
                    <TipItem text="Gunakan radius lokasi yang sesuai dengan area sekolah." />
                    <TipItem text="Periksa kembali pengaturan sebelum disimpan." />
                  </div>
                </div>
              </aside>
            </div>

            {/* ==================================================
                MOBILE SAVE BUTTON
            ================================================== */}
            <div className="sm:hidden mt-6">
              <button
                type="button"
                onClick={handleSave}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  saved
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {saved ? (
                  <>
                    <Check size={17} />
                    Tersimpan
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}
            <div className="py-7 text-center">
              <p className="text-xs text-slate-400">
                SmartSchool Admin • Pengaturan Presensi
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================================================================
   SECTION HEADER
================================================================ */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-slate-800">
          {title}
        </h2>

        <p className="text-xs text-slate-500 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   TIME INPUT
================================================================ */

function TimeInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative mt-2">
        <Clock3
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />

        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>
    </div>
  );
}

/* ================================================================
   DAY CARD
================================================================ */

function DayCard({
  label,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative rounded-xl border p-3 text-left transition-all ${
        checked
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-sm font-semibold ${
            checked
              ? "text-blue-700"
              : "text-slate-600"
          }`}
        >
          {label}
        </span>

        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${
            checked
              ? "bg-blue-600 text-white"
              : "border border-slate-300 text-transparent"
          }`}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </div>
      </div>
    </button>
  );
}

/* ================================================================
   TOGGLE ROW
================================================================ */

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-label={title}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${
          checked
            ? "bg-blue-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked
              ? "translate-x-5"
              : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* ================================================================
   SUMMARY ROW
================================================================ */

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-800 text-right">
        {value}
      </span>
    </div>
  );
}

/* ================================================================
   TIP ITEM
================================================================ */

function TipItem({ text }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />

      <p className="text-xs text-slate-300 leading-relaxed">
        {text}
      </p>
    </div>
  );
}