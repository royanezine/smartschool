"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  HeartHandshake,
  MessageCircle,
  CheckCircle2,
  CircleAlert,
  Loader2,
  RefreshCw,
  Search,
  CalendarCheck,
  ClipboardList,
  UserRound,
  ArrowRight,
  XCircle,
  History,
  Plus,
  ShieldCheck,
  Layers3,
  CalendarClock,
  XOctagon,
} from "lucide-react";

import {
  ajukanSesiKonseling,
  getSesiKonseling,
} from "@/services/bk.service";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

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

const themeSuccessText =
  "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText =
  "text-[var(--color-warning)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)]";

const themeDangerText =
  "text-[var(--color-danger)]";


const TOPIK_KONSELING = [
  "Akademik",
  "Pribadi",
  "Sosial",
  "Karier",
  "Lainnya",
];

const SLOT_WAKTU = [
  { mulai: "08:00", selesai: "08:30" },
  { mulai: "08:30", selesai: "09:00" },
  { mulai: "09:00", selesai: "09:30" },
  { mulai: "09:30", selesai: "10:00" },
  { mulai: "10:00", selesai: "10:30" },
  { mulai: "10:30", selesai: "11:00" },
  { mulai: "11:00", selesai: "11:30" },
  { mulai: "11:30", selesai: "12:00" },
  { mulai: "13:00", selesai: "13:30" },
  { mulai: "13:30", selesai: "14:00" },
  { mulai: "14:00", selesai: "14:30" },
  { mulai: "14:30", selesai: "15:00" },
];


const STATUS_CONFIG = {
  diajukan: {
    label: "Menunggu",
    className: `${themeWarningSurface} ${themeWarningText} ${themeWarningBorder}`,
    icon: Clock3,
  },
  dijadwalkan: {
    label: "Disetujui",
    className: `${themeSuccessSurface} ${themeSuccessText} ${themeSuccessBorder}`,
    icon: CheckCircle2,
  },
  ditolak: {
    label: "Ditolak",
    className: `${themeDangerSurface} ${themeDangerText} ${themeDangerBorder}`,
    icon: XCircle,
  },
  dibatalkan: {
    label: "Dibatalkan",
    className: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
    icon: CircleAlert,
  },
};


function getTodayWib() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

function getBulanTahun(date) {
  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function getListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[String(status || "").toLowerCase()] || {
      label: status || "Belum ada status",
      className: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
      icon: CircleAlert,
    }
  );
}

function isSlotBentrok(sesi, tanggal, mulai, selesai) {
  const tanggalSesi = String(sesi?.tanggal || "").slice(0, 10);
  const status = String(sesi?.status || "").toLowerCase();

  if (tanggalSesi !== tanggal) return false;
  if (!["diajukan", "dijadwalkan"].includes(status)) return false;
  if (!sesi?.waktuMulai || !sesi?.waktuSelesai) return false;

  return mulai < sesi.waktuSelesai && sesi.waktuMulai < selesai;
}

function getTanggalSesi(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return "";
}


export default function BookingKonselingPage() {
  const today = useMemo(() => getTodayWib(), []);

  const [activeTab, setActiveTab] = useState("booking");

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [selectedTime, setSelectedTime] = useState(null);
  const [topik, setTopik] = useState("");
  const [masalah, setMasalah] = useState("");

  const [sesiKonseling, setSesiKonseling] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError("");

    try {
      const response = await getSesiKonseling();
      setSesiKonseling(getListResponse(response));
    } catch (error) {
      setHistoryError(
        error?.message || "Riwayat konseling gagal dimuat.",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHistory]);

  const tanggalHariIni = toDateKey(today);


  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < offset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDate; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const sesiPadaTanggal = useMemo(
    () =>
      sesiKonseling.filter(
        (sesi) =>
          getTanggalSesi(sesi.tanggal) === selectedDate &&
          ["diajukan", "dijadwalkan"].includes(
            String(sesi.status || "").toLowerCase(),
          ),
      ),
    [sesiKonseling, selectedDate],
  );

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...sesiKonseling]
      .filter((sesi) => {
        if (
          statusFilter !== "semua" &&
          String(sesi.status || "").toLowerCase() !== statusFilter
        ) {
          return false;
        }

        if (!query) return true;

        const searchable = [
          sesi.topik,
          sesi.masalah,
          sesi.catatan,
          sesi.hasil,
          sesi.tindakLanjut,
          sesi.konselor?.namaLengkap,
          sesi.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggal || 0).getTime();
        const dateB = new Date(b.tanggal || 0).getTime();

        return dateB - dateA;
      });
  }, [sesiKonseling, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const countStatus = (status) =>
      sesiKonseling.filter(
        (sesi) =>
          String(sesi.status || "").toLowerCase() === status,
      ).length;

    return {
      total: sesiKonseling.length,
      diajukan: countStatus("diajukan"),
      dijadwalkan: countStatus("dijadwalkan"),
      ditolak: countStatus("ditolak"),
      dibatalkan: countStatus("dibatalkan"),
      slotHariIni: sesiPadaTanggal.length,
    };
  }, [sesiKonseling, sesiPadaTanggal]);

  const selectedDateObject = useMemo(() => {
    if (!selectedDate) return null;

    const [year, month, day] = selectedDate.split("-").map(Number);

    return new Date(year, month - 1, day);
  }, [selectedDate]);

  const selectedSlot = SLOT_WAKTU.find(
    (slot) => slot.mulai === selectedTime,
  );

  const isDateSelectable = (date) => {
    if (!date) return false;

    return toDateKey(date) >= tanggalHariIni;
  };

  const handleSelectDate = (date) => {
    if (!date || !isDateSelectable(date)) return;

    setSelectedDate(toDateKey(date));
    setSelectedTime(null);
    setBookingError("");
    setBookingSuccess("");
  };

  const changeMonth = (direction) => {
    setCurrentMonth((previous) => {
      return new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1,
      );
    });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setBookingError("");
    setBookingSuccess("");

    if (!selectedDate) {
      setBookingError("Silakan pilih tanggal konseling terlebih dahulu.");
      return;
    }

    if (selectedDate < tanggalHariIni) {
      setBookingError("Tanggal konseling tidak boleh di masa lalu.");
      return;
    }

    if (!selectedSlot) {
      setBookingError("Silakan pilih waktu konseling.");
      return;
    }

    if (!topik.trim()) {
      setBookingError("Silakan pilih topik konseling.");
      return;
    }

    if (topik.trim().length > 150) {
      setBookingError("Topik maksimal 150 karakter.");
      return;
    }

    if (
      sesiKonseling.some((sesi) =>
        isSlotBentrok(
          sesi,
          selectedDate,
          selectedSlot.mulai,
          selectedSlot.selesai,
        ),
      )
    ) {
      setBookingError(
        "Kamu sudah memiliki pengajuan atau sesi pada jam tersebut. Pilih waktu lain.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await ajukanSesiKonseling({
        tanggal: selectedDate,
        waktuMulai: selectedSlot.mulai,
        waktuSelesai: selectedSlot.selesai,
        topik: topik.trim(),
        masalah: masalah.trim() || undefined,
      });

      setBookingSuccess(
        "Pengajuan konseling berhasil dikirim. Silakan pantau statusnya pada tab Riwayat Konseling.",
      );

      setSelectedTime(null);
      setTopik("");
      setMasalah("");

      await loadHistory();
      setActiveTab("riwayat");
    } catch (error) {
      setBookingError(
        error?.message || "Pengajuan konseling gagal dikirim.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

        <section
          className={`
            theme-card
            relative
            isolate
            overflow-hidden
            rounded-2xl
            border
            ${themeNeutralBorder}
            ${themeCardShadow}
          `}
        >
          <div
            className={`
              absolute
              inset-0
              -z-30
              ${themePrimarySoft}
            `}
          />

          <div
            className="
              absolute
              -right-24
              -top-28
              -z-20
              h-72
              w-72
              rounded-full
              bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-32
              right-[20%]
              -z-20
              h-72
              w-72
              rounded-full
              bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]
              blur-3xl
            "
          />

          <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div
                  className="
                    mb-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-card)_95%,transparent)]
                    px-3
                    py-1.5
                    shadow-sm
                    backdrop-blur
                  "
                >
                  <div
                    className={`
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      ${themePrimarySoft}
                      ${themePrimaryText}
                    `}
                  >
                    <HeartHandshake size={13} />
                  </div>

                  <span
                    className="
                      text-xs
                      font-semibold
                      tracking-wide
                      text-[var(--color-primary)]
                    "
                  >
                    BIMBINGAN KONSELING
                  </span>

                  <span
                    className="
                      h-1
                      w-1
                      rounded-full
                      bg-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]
                    "
                  />

                  <span className="theme-text-secondary text-xs font-medium">
                    Siswa
                  </span>
                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                  <span>Konseling Siswa</span>
                  <span
                    className="
                      mt-1
                      block
                      bg-[linear-gradient(90deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_70%,var(--color-info)))]
                      bg-clip-text
                      text-transparent
                    "
                  >
                    Ajukan & pantau sesi
                  </span>
                </h1>

                <p className="theme-text-secondary mt-3 max-w-xl text-sm leading-6">
                  Ajukan sesi konseling bersama guru BK dan pantau
                  perkembangan pengajuanmu melalui satu halaman.
                </p>
              </div>

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  self-start
                  rounded-lg
                  border
                  ${themeNeutralBorder}
                  bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]
                  px-3
                  py-2
                  text-xs
                  font-medium
                  theme-text-secondary
                  shadow-sm
                `}
              >
                <ShieldCheck
                  size={15}
                  className={themePrimaryText}
                />
                Data konseling bersifat rahasia
              </div>
            </div>
          </div>

          <div
            className="
              absolute
              bottom-0
              left-0
              h-1
              w-full
              bg-[linear-gradient(90deg,var(--color-primary),var(--color-info))]
            "
          />
        </section>


        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Total sesi</p>
                <p className="mt-1 text-xl font-bold theme-text">
                  {isLoadingHistory ? "—" : stats.total}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}>
                <Layers3 size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Menunggu</p>
                <p className="mt-1 text-xl font-bold theme-text">
                  {isLoadingHistory ? "—" : stats.diajukan}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeWarningSurface} ${themeWarningText}`}>
                <Clock3 size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Disetujui</p>
                <p className="mt-1 text-xl font-bold theme-text">
                  {isLoadingHistory ? "—" : stats.dijadwalkan}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSuccessSurface} ${themeSuccessText}`}>
                <CheckCircle2 size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Ditolak</p>
                <p className="mt-1 text-xl font-bold theme-text">
                  {isLoadingHistory ? "—" : stats.ditolak}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeDangerSurface} ${themeDangerText}`}>
                <XOctagon size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Dibatalkan</p>
                <p className="mt-1 text-xl font-bold theme-text">
                  {isLoadingHistory ? "—" : stats.dibatalkan}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}>
                <CircleAlert size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Sesi tanggal ini</p>
                <p className="mt-1 text-xl font-bold theme-text">
                  {isLoadingHistory ? "—" : stats.slotHariIni}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}>
                <CalendarClock size={17} />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`
            theme-card
            flex
            flex-wrap
            gap-2
            rounded-xl
            border
            ${themeNeutralBorder}
            p-2
            ${themeCardShadow}
          `}
        >
          <button
            type="button"
            onClick={() => setActiveTab("booking")}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-4
              py-2.5
              text-sm
              font-semibold
              transition
              ${
                activeTab === "booking"
                  ? `bg-[var(--color-primary)] text-white shadow-sm`
                  : `theme-text-secondary ${themeNeutralHover}`
              }
            `}
          >
            <Plus size={17} />
            Booking Konseling
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("riwayat");
              loadHistory();
            }}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-4
              py-2.5
              text-sm
              font-semibold
              transition
              ${
                activeTab === "riwayat"
                  ? `bg-[var(--color-primary)] text-white shadow-sm`
                  : `theme-text-secondary ${themeNeutralHover}`
              }
            `}
          >
            <History size={17} />
            Riwayat Konseling
            {stats.diajukan > 0 && (
              <span
                className={`
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  px-1
                  text-xs
                  ${
                    activeTab === "riwayat"
                      ? "bg-white text-[var(--color-primary)]"
                      : `${themeWarningSurface} ${themeWarningText}`
                  }
                `}
              >
                {stats.diajukan}
              </span>
            )}
          </button>
        </div>

        {activeTab === "booking" && (
          <section>
            <form onSubmit={handleSubmit}>
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)] 2xl:grid-cols-[minmax(0,1.8fr)_minmax(380px,0.7fr)]">
                <div className="space-y-6">
                  <div
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      p-5
                      sm:p-6
                      ${themeCardShadow}
                    `}
                  >
                    <div className="mb-5 flex items-start gap-3">
                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <h2 className="theme-text font-semibold">
                          Pilih Tanggal
                        </h2>
                        <p className="theme-text-secondary mt-1 text-sm">
                          Pilih tanggal yang sesuai untuk sesi konseling.
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        disabled={
                          currentMonth.getFullYear() === today.getFullYear() &&
                          currentMonth.getMonth() === today.getMonth()
                        }
                        className={`
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          ${themeNeutralBorder}
                          theme-text-secondary
                          transition
                          ${themeNeutralHover}
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        `}
                        aria-label="Bulan sebelumnya"
                      >
                        <ArrowRight className="rotate-180" size={17} />
                      </button>

                      <h3 className="theme-text font-semibold capitalize">
                        {getBulanTahun(currentMonth)}
                      </h3>

                      <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        className={`
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          ${themeNeutralBorder}
                          theme-text-secondary
                          transition
                          ${themeNeutralHover}
                        `}
                        aria-label="Bulan berikutnya"
                      >
                        <ArrowRight size={17} />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                        (day) => (
                          <div
                            key={day}
                            className="theme-text-muted py-2 text-center text-xs font-semibold"
                          >
                            {day}
                          </div>
                        ),
                      )}

                      {calendarDays.map((date, index) => {
                        if (!date) {
                          return <div key={`empty-${index}`} />;
                        }

                        const dateKey = toDateKey(date);
                        const selected = dateKey === selectedDate;
                        const todaySelected = dateKey === tanggalHariIni;
                        const disabled = !isDateSelectable(date);

                        return (
                          <button
                            key={dateKey}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleSelectDate(date)}
                            className={`
                              relative
                              flex
                              aspect-square
                              items-center
                              justify-center
                              rounded-xl
                              text-sm
                              font-medium
                              transition
                              ${
                                selected
                                  ? `bg-[var(--color-primary)] text-white shadow-sm`
                                  : todaySelected
                                    ? `${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder}`
                                    : `theme-text ${themeNeutralHover}`
                              }
                              ${
                                disabled
                                  ? "theme-text-muted cursor-not-allowed hover:bg-transparent"
                                  : ""
                              }
                            `}
                          >
                            {date.getDate()}
                            {todaySelected && !selected && (
                              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--color-primary)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div
                      className={`
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-4
                        border-t
                        ${themeDivider}
                        pt-4
                        text-xs
                        theme-text-secondary
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded bg-[var(--color-primary)]" />
                        Tanggal dipilih
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className={`
                            h-3
                            w-3
                            rounded
                            border
                            ${themePrimarySoftBorder}
                            ${themePrimarySoft}
                          `}
                        />
                        Hari ini
                      </span>
                    </div>

                    <div
                      className={`
                        mt-5
                        rounded-xl
                        ${themeNeutralSurface}
                        p-3.5
                      `}
                    >
                      <p className="theme-text-secondary text-xs font-medium">
                        Tanggal pilihanmu
                      </p>
                      <p className="theme-text mt-1 font-semibold capitalize">
                        {selectedDateObject
                          ? formatTanggal(selectedDateObject)
                          : "Belum dipilih"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      p-5
                      sm:p-6
                      ${themeCardShadow}
                    `}
                  >
                    <div className="mb-5 flex items-start gap-3">
                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >
                        <Clock3 size={20} />
                      </div>
                      <div>
                        <h2 className="theme-text font-semibold">
                          Pilih Waktu
                        </h2>
                        <p className="theme-text-secondary mt-1 text-sm">
                          Setiap sesi berlangsung selama 30 menit.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-4">
                      {SLOT_WAKTU.map((slot) => {
                        const selected = selectedTime === slot.mulai;
                        const bentrok = sesiPadaTanggal.some((sesi) =>
                          isSlotBentrok(
                            sesi,
                            selectedDate,
                            slot.mulai,
                            slot.selesai,
                          ),
                        );

                        return (
                          <button
                            key={slot.mulai}
                            type="button"
                            disabled={bentrok}
                            onClick={() => {
                              setSelectedTime(slot.mulai);
                              setBookingError("");
                              setBookingSuccess("");
                            }}
                            className={`
                              rounded-xl
                              border
                              px-3
                              py-3
                              text-sm
                              font-medium
                              transition
                              ${
                                selected
                                  ? `bg-[var(--color-primary)] text-white border-[var(--color-primary)]`
                                  : bentrok
                                    ? `cursor-not-allowed ${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`
                                    : `theme-text ${themeNeutralBorder} hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] hover:${themePrimarySoft}`
                              }
                            `}
                          >
                            <span className="block">{slot.mulai}</span>
                            <span
                              className={`
                                mt-1
                                block
                                text-xs
                                ${
                                  selected
                                    ? "text-white/80"
                                    : bentrok
                                      ? "theme-text-muted"
                                      : "theme-text-muted"
                                }
                              `}
                            >
                              {bentrok
                                ? "Tidak tersedia"
                                : `s.d. ${slot.selesai}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="theme-text-muted mt-4 text-xs leading-5">
                      Waktu yang memiliki pengajuan atau sesi terjadwal pada
                      tanggal pilihanmu akan ditandai tidak tersedia.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      p-5
                      sm:p-6
                      ${themeCardShadow}
                    `}
                  >
                    <div className="mb-5 flex items-start gap-3">
                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >
                        <MessageCircle size={20} />
                      </div>
                      <div>
                        <h2 className="theme-text font-semibold">
                          Detail Konseling
                        </h2>
                        <p className="theme-text-secondary mt-1 text-sm">
                          Ceritakan topik yang ingin kamu konsultasikan.
                        </p>
                      </div>
                    </div>

                    <label
                      htmlFor="topik"
                      className="theme-text mb-2 block text-sm font-medium"
                    >
                      Topik Konseling
                      <span className="ml-1 text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <select
                      id="topik"
                      value={topik}
                      onChange={(event) => {
                        setTopik(event.target.value);
                        setBookingError("");
                        setBookingSuccess("");
                      }}
                      className={`
                        theme-text
                        mb-5
                        w-full
                        rounded-xl
                        border
                        ${themeNeutralBorder}
                        bg-[var(--color-card)]
                        px-3.5
                        py-3
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--color-primary)]
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                      `}
                      required
                    >
                      <option value="">Pilih topik konseling</option>
                      {TOPIK_KONSELING.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="masalah"
                        className="theme-text text-sm font-medium"
                      >
                        Ceritakan Masalah
                      </label>
                      <span className="theme-text-muted text-xs">
                        {masalah.length}/2000
                      </span>
                    </div>

                    <textarea
                      id="masalah"
                      value={masalah}
                      onChange={(event) => {
                        setMasalah(event.target.value.slice(0, 2000));
                        setBookingError("");
                        setBookingSuccess("");
                      }}
                      rows={5}
                      maxLength={2000}
                      placeholder="Tuliskan hal yang ingin kamu diskusikan dengan guru BK. Bagian ini boleh dikosongkan."
                      className={`
                        theme-text
                        w-full
                        resize-y
                        rounded-xl
                        border
                        ${themeNeutralBorder}
                        bg-[var(--color-card)]
                        px-3.5
                        py-3
                        text-sm
                        leading-6
                        outline-none
                        transition
                        placeholder:text-[var(--color-text-muted)]
                        focus:border-[var(--color-primary)]
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                      `}
                    />

                    <p className="theme-text-muted mt-2 text-xs leading-5">
                      Informasi ini membantu guru BK memahami kebutuhanmu
                      sebelum sesi dimulai.
                    </p>

                    {bookingError && (
                      <div
                        className={`
                          mt-5
                          flex
                          items-start
                          gap-2.5
                          rounded-xl
                          border
                          p-3.5
                          text-sm
                          ${themeDangerBorder}
                          ${themeDangerSurface}
                          ${themeDangerText}
                        `}
                      >
                        <CircleAlert
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                        <p>{bookingError}</p>
                      </div>
                    )}

                    {bookingSuccess && (
                      <div
                        className={`
                          mt-5
                          flex
                          items-start
                          gap-2.5
                          rounded-xl
                          border
                          p-3.5
                          text-sm
                          ${themeSuccessBorder}
                          ${themeSuccessSurface}
                          ${themeSuccessText}
                        `}
                      >
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                        <p>{bookingSuccess}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="
                        mt-6
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[var(--color-primary)]
                        px-4
                        py-3.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-primary)_85%,black)]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Mengirim Pengajuan...
                        </>
                      ) : (
                        <>
                          <CalendarCheck size={18} />
                          Ajukan Konseling
                        </>
                      )}
                    </button>

                    <p className="theme-text-muted mt-3 text-center text-xs leading-5">
                      Pengajuan akan berstatus menunggu hingga diproses guru BK.
                    </p>
                  </div>

                  <div
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      p-5
                      sm:p-6
                      ${themeCardShadow}
                    `}
                  >
                    <h3 className="theme-text mb-4 font-semibold">
                      Ringkasan Booking
                    </h3>

                    <SummaryRow
                      icon={CalendarDays}
                      label="Tanggal"
                      value={
                        selectedDateObject
                          ? formatTanggal(selectedDateObject)
                          : "Belum dipilih"
                      }
                    />

                    <SummaryRow
                      icon={Clock3}
                      label="Waktu"
                      value={
                        selectedSlot
                          ? `${selectedSlot.mulai}–${selectedSlot.selesai}`
                          : "Belum dipilih"
                      }
                    />

                    <SummaryRow
                      icon={FileText}
                      label="Topik"
                      value={topik || "Belum dipilih"}
                    />

                    <div
                      className={`
                        mt-4
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        p-3.5
                        ${themePrimarySoft}
                      `}
                    >
                      <ShieldCheck
                        size={19}
                        className={`mt-0.5 shrink-0 ${themePrimaryText}`}
                      />
                      <p className="text-xs leading-5 text-[var(--color-primary)]">
                        Sampaikan informasi seperlunya. Pengajuanmu akan
                        ditinjau oleh pihak sekolah sesuai proses konseling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </section>
        )}

        {activeTab === "riwayat" && (
          <section>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="theme-text text-xl font-bold">
                  Riwayat Konseling
                </h2>
                <p className="theme-text-secondary mt-1 text-sm">
                  Pantau status pengajuan dan informasi sesi konselingmu.
                </p>
              </div>

              <button
                type="button"
                onClick={loadHistory}
                disabled={isLoadingHistory}
                className={`
                  theme-card
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  ${themeNeutralBorder}
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  theme-text
                  transition
                  ${themeNeutralHover}
                  disabled:opacity-60
                `}
              >
                <RefreshCw
                  size={16}
                  className={isLoadingHistory ? "animate-spin" : ""}
                />
                Perbarui
              </button>
            </div>

            <div
              className={`
                theme-card
                mb-5
                rounded-2xl
                border
                ${themeNeutralBorder}
                p-4
                sm:p-5
                ${themeCardShadow}
              `}
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search
                    size={18}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Cari topik, masalah, atau guru BK..."
                    className={`
                      theme-text
                      w-full
                      rounded-xl
                      border
                      ${themeNeutralBorder}
                      bg-[var(--color-card)]
                      py-3
                      pl-10
                      pr-3.5
                      text-sm
                      outline-none
                      transition
                      placeholder:text-[var(--color-text-muted)]
                      focus:border-[var(--color-primary)]
                      focus:ring-2
                      focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                    `}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={`
                    theme-text
                    w-full
                    rounded-xl
                    border
                    ${themeNeutralBorder}
                    bg-[var(--color-card)]
                    px-3.5
                    py-3
                    text-sm
                    outline-none
                    focus:border-[var(--color-primary)]
                    focus:ring-2
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                  `}
                >
                  <option value="semua">Semua Status</option>
                  <option value="diajukan">Menunggu</option>
                  <option value="dijadwalkan">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            {isLoadingHistory ? (
              <div
                className={`
                  theme-card
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  ${themeNeutralBorder}
                  px-5
                  py-16
                  text-center
                  ${themeCardShadow}
                `}
              >
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    ${themePrimarySoft}
                    ${themePrimaryText}
                  `}
                >
                  <Loader2 size={22} className="animate-spin" />
                </div>
                <p className="theme-text mt-4 text-sm font-medium">
                  Memuat riwayat konseling...
                </p>
              </div>
            ) : historyError ? (
              <div
                className={`
                  theme-card
                  rounded-2xl
                  border
                  ${themeDangerBorder}
                  p-6
                  text-center
                  ${themeCardShadow}
                `}
              >
                <div
                  className={`
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    ${themeDangerSurface}
                    ${themeDangerText}
                  `}
                >
                  <CircleAlert size={22} />
                </div>
                <p className="theme-text mt-3 text-sm font-semibold">
                  Riwayat belum dapat dimuat
                </p>
                <p className="theme-text-secondary mt-1 text-sm">
                  {historyError}
                </p>
                <button
                  type="button"
                  onClick={loadHistory}
                  className="
                    mt-4
                    rounded-xl
                    bg-[var(--color-primary)]
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-[color-mix(in_srgb,var(--color-primary)_85%,black)]
                  "
                >
                  Coba Lagi
                </button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div
                className={`
                  theme-card
                  rounded-2xl
                  border
                  ${themeNeutralBorder}
                  px-5
                  py-16
                  text-center
                  ${themeCardShadow}
                `}
              >
                <div
                  className={`
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    ${themeNeutralSurface}
                    theme-text-secondary
                  `}
                >
                  <History size={25} />
                </div>
                <h3 className="theme-text mt-4 font-semibold">
                  {sesiKonseling.length === 0
                    ? "Belum ada riwayat konseling"
                    : "Tidak ada sesi yang sesuai"}
                </h3>
                <p className="theme-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                  {sesiKonseling.length === 0
                    ? "Pengajuan konseling yang kamu kirim akan muncul di sini."
                    : "Coba ubah kata kunci pencarian atau filter status."}
                </p>
                {sesiKonseling.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("booking")}
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[var(--color-primary)]
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      hover:bg-[color-mix(in_srgb,var(--color-primary)_85%,black)]
                    "
                  >
                    <Plus size={17} />
                    Booking Konseling
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 overflow-x-auto">
                <div className="min-w-[560px] space-y-4">
                  {filteredHistory.map((sesi) => (
                    <HistoryCard key={sesi.id} sesi={sesi} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}


function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div
      className={`
        flex
        items-start
        gap-3
        border-b
        ${themeDivider}
        py-3
        last:border-b-0
      `}
    >
      <Icon size={17} className="theme-text-muted mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="theme-text-secondary text-xs">{label}</p>
        <p className="theme-text mt-1 break-words text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}


function HistoryCard({ sesi }) {
  const config = getStatusConfig(sesi.status);
  const StatusIcon = config.icon;

  return (
    <article
      className={`
        theme-card
        rounded-2xl
        border
        ${themeNeutralBorder}
        p-5
        sm:p-6
        ${themeCardShadow}
      `}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${themePrimarySoft}
              ${themePrimaryText}
            `}
          >
            <HeartHandshake size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="theme-text break-words font-semibold">
              {sesi.topik || "Konseling"}
            </h3>
            <p className="theme-text-secondary mt-1 text-sm">
              {formatTanggal(sesi.tanggal)}
            </p>
          </div>
        </div>

        <span
          className={`
            inline-flex
            w-fit
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            px-3
            py-1.5
            text-xs
            font-semibold
            ${config.className}
          `}
        >
          <StatusIcon size={14} />
          {config.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className={`rounded-xl ${themeNeutralSurface} p-3.5`}>
          <div className="theme-text-secondary flex items-center gap-2 text-xs">
            <Clock3 size={15} />
            Waktu Sesi
          </div>
          <p className="theme-text mt-1.5 text-sm font-semibold">
            {sesi.waktuMulai && sesi.waktuSelesai
              ? `${sesi.waktuMulai} – ${sesi.waktuSelesai}`
              : "Belum ditentukan"}
          </p>
        </div>

        <div className={`rounded-xl ${themeNeutralSurface} p-3.5`}>
          <div className="theme-text-secondary flex items-center gap-2 text-xs">
            <UserRound size={15} />
            Guru BK / Konselor
          </div>
          <p className="theme-text mt-1.5 text-sm font-semibold">
            {sesi.konselor?.namaLengkap || "Belum ditentukan"}
          </p>
        </div>
      </div>

      {sesi.masalah && (
        <DetailBlock title="Cerita atau Masalah" value={sesi.masalah} />
      )}

      {sesi.catatan && (
        <DetailBlock
          title={sesi.status === "ditolak" ? "Alasan Penolakan" : "Catatan"}
          value={sesi.catatan}
        />
      )}

      {sesi.hasil && <DetailBlock title="Hasil Konseling" value={sesi.hasil} />}

      {sesi.tindakLanjut && (
        <DetailBlock
          title="Tindak Lanjut"
          value={sesi.tindakLanjut}
        />
      )}

      {sesi.status === "diajukan" && (
        <div
          className={`
            mt-4
            flex
            items-start
            gap-2.5
            rounded-xl
            border
            p-3.5
            ${themeWarningBorder}
            ${themeWarningSurface}
          `}
        >
          <Clock3
            size={17}
            className={`mt-0.5 shrink-0 ${themeWarningText}`}
          />
          <p className={`text-sm leading-5 ${themeWarningText}`}>
            Pengajuanmu sedang menunggu keputusan guru BK.
          </p>
        </div>
      )}

      {sesi.status === "dijadwalkan" && (
        <div
          className={`
            mt-4
            flex
            items-start
            gap-2.5
            rounded-xl
            border
            p-3.5
            ${themeSuccessBorder}
            ${themeSuccessSurface}
          `}
        >
          <CheckCircle2
            size={17}
            className={`mt-0.5 shrink-0 ${themeSuccessText}`}
          />
          <p className={`text-sm leading-5 ${themeSuccessText}`}>
            Pengajuanmu telah disetujui. Pastikan hadir sesuai tanggal dan
            waktu yang tercantum.
          </p>
        </div>
      )}
    </article>
  );
}


function DetailBlock({ title, value }) {
  return (
    <div className="mt-4">
      <p className="theme-text-muted mb-1.5 text-xs font-semibold uppercase tracking-wide">
        {title}
      </p>
      <p className="theme-text whitespace-pre-wrap break-words text-sm leading-6">
        {value}
      </p>
    </div>
  );
}