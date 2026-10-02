"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  ArrowLeft,
  CalendarClock,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  CalendarDays,
  BookMarked,
  Info,
  Search,
  ChevronDown,
  X,
  Clock3,
  School,
  CircleCheck,
  DoorOpen,
  Users,
} from "lucide-react";

import {
  getKelasMapel,
} from "../../../../../../services/kelasMapel.service";

import {
  createJadwalMengajar,
} from "../../../../../../services/jadwalMengajar.service";

/* =========================================================
   HARI
========================================================= */

const HARI = [
  {
    key: "senin",
    label: "Senin",
  },
  {
    key: "selasa",
    label: "Selasa",
  },
  {
    key: "rabu",
    label: "Rabu",
  },
  {
    key: "kamis",
    label: "Kamis",
  },
  {
    key: "jumat",
    label: "Jumat",
  },
  {
    key: "sabtu",
    label: "Sabtu",
  },
];

/* =========================================================
   EMPTY JADWAL
========================================================= */

const emptyJadwal = () =>
  HARI.reduce((acc, hari) => {
    acc[hari.key] = {
      jamMulai: "",
      jamSelesai: "",
    };

    return acc;
  }, {});

/* =========================================================
   INITIALS
========================================================= */

const getInitials = (name = "") => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[1][0]
    ).toUpperCase();
  }

  return name
    .slice(0, 2)
    .toUpperCase();
};

/* =========================================================
   SEARCHABLE SELECT
========================================================= */

function SearchableSelect({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  renderOption,
}) {
  const [open, setOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const selectedOption =
    options.find(
      (item) =>
        item.value === value
    ) || null;

  const filteredOptions =
    useMemo(() => {
      const keyword =
        query
          .trim()
          .toLowerCase();

      if (!keyword) {
        return options;
      }

      return options.filter(
        (item) => {
          const text =
            `${item.label || ""} ${
              item.value || ""
            } ${
              item.searchText || ""
            }`.toLowerCase();

          return text.includes(
            keyword
          );
        }
      );
    }, [options, query]);

  const handleSelect = (item) => {
    onChange(item.value);
    setQuery("");
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">
        <Icon
          size={14}
          className="theme-text-muted"
        />

        {label}

        <span className="text-[var(--color-danger)]">
          *
        </span>
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border px-3.5 text-left text-sm transition theme-input ${
          open
            ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10"
            : "hover:border-[var(--color-primary)]"
        } ${
          disabled
            ? "cursor-not-allowed opacity-70"
            : ""
        }`}
      >
        <span className="min-w-0 truncate">
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 theme-text-muted transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup dropdown"
            onClick={handleClose}
            className="fixed inset-0 z-30 cursor-default"
          />

          <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border theme-card theme-border shadow-xl">

            {/* SEARCH */}

            <div className="border-b theme-border-soft p-3">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                />

                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) =>
                    setQuery(
                      e.target.value
                    )
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  placeholder={`Cari ${label.toLowerCase()}...`}
                  className="h-10 w-full rounded-lg border px-9 pr-3 text-xs outline-none transition theme-input focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* OPTIONS */}

            <div className="max-h-72 overflow-y-auto p-1.5">
              {filteredOptions.length >
              0 ? (
                filteredOptions.map(
                  (item) => {
                    const selected =
                      item.value ===
                      value;

                    return (
                      <button
                        type="button"
                        key={
                          item.value
                        }
                        onClick={() =>
                          handleSelect(
                            item
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                          selected
                            ? "theme-sidebar-active"
                            : "theme-text-secondary theme-table-hover"
                        }`}
                      >
                        {renderOption
                          ? renderOption(
                              item,
                              selected
                            )
                          : (
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">
                                {
                                  item.label
                                }
                              </p>
                            </div>
                          )}

                        {selected && (
                          <CircleCheck
                            size={15}
                            className="ml-auto shrink-0 text-[var(--color-primary)]"
                          />
                        )}
                      </button>
                    );
                  }
                )
              ) : (
                <div className="px-4 py-8 text-center">
                  <Search
                    size={20}
                    className="mx-auto theme-text-placeholder"
                  />

                  <p className="mt-2 text-xs font-semibold theme-text-muted">
                    Data tidak ditemukan
                  </p>

                  <p className="mt-1 text-[10px] theme-text-placeholder">
                    Coba kata pencarian lain.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {selectedOption && (
        <p className="mt-1 text-[10px] theme-text-placeholder">
          Pilihan saat ini:{" "}
          <span className="font-medium theme-text-muted">
            {
              selectedOption.label
            }
          </span>
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TambahJadwalMengajarPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  /* =======================================================
     DATA KELAS MAPEL
  ======================================================= */

  const [kelasMapelList, setKelasMapelList] =
    useState([]);

  const [loadingData, setLoadingData] =
    useState(true);

  const [selectedKelasMapelId, setSelectedKelasMapelId] =
    useState("");

  /* =======================================================
     JADWAL
  ======================================================= */

  const [jadwal, setJadwal] =
    useState(emptyJadwal());

  const [ruangan, setRuangan] =
    useState("");

  /* =======================================================
     STATE
  ======================================================= */

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  /* =======================================================
     TOGGLE SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed(
      (prev) => !prev
    );
  };

  /* =======================================================
     LOAD KELAS MAPEL
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchKelasMapel = async () => {
      try {
        setLoadingData(true);
        setError("");

        const response =
          await getKelasMapel();

        if (!mounted) {
          return;
        }

        const data =
          Array.isArray(response)
            ? response
            : [];

        setKelasMapelList(
          data
        );

        console.log(
          "========== KELAS MAPEL =========="
        );

        console.log(
          "DATA:",
          data
        );

        console.log(
          "================================="
        );
      } catch (err) {
        console.error(
          "Error mengambil kelas mapel:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil data kelas mapel."
          );
        }
      } finally {
        if (mounted) {
          setLoadingData(
            false
          );
        }
      }
    };

    fetchKelasMapel();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     OPTIONS KELAS MAPEL
  ======================================================= */

  const kelasMapelOptions =
    useMemo(() => {
      return kelasMapelList
        .filter(
          (item) =>
            item &&
            item.id &&
            item.kelasMapel !== null
        )
        .map((item) => {
          const kelas =
            item.kelas || {};

          const mapel =
            item.mataPelajaran ||
            {};

          const guru =
            item.guruPengajar ||
            {};

          const kelasNama =
            kelas.nama ||
            "-";

          const mapelNama =
            mapel.nama ||
            "-";

          const mapelKode =
            mapel.kode ||
            "";

          const guruNama =
            guru.namaLengkap ||
            "-";

          const guruNip =
            guru.nip ||
            "";

          return {
            value: item.id,

            label:
              `${mapelNama} • ${kelasNama}`,

            searchText:
              `${mapelNama} ${mapelKode} ${kelasNama} ${guruNama} ${guruNip}`,

            kelasNama,

            mapelNama,

            mapelKode,

            guruNama,

            guruNip,
          };
        });
    }, [kelasMapelList]);

  /* =======================================================
     KELAS MAPEL TERPILIH
  ======================================================= */

  const kelasMapelTerpilih =
    useMemo(() => {
      return (
        kelasMapelOptions.find(
          (item) =>
            item.value ===
            selectedKelasMapelId
        ) || null
      );
    }, [
      kelasMapelOptions,
      selectedKelasMapelId,
    ]);

  /* =======================================================
     JADWAL HANDLER
  ======================================================= */

  const handleSlotChange =
    (hariKey, field) =>
    (event) => {
      const value =
        event.target.value;

      setJadwal((prev) => ({
        ...prev,

        [hariKey]: {
          ...prev[hariKey],
          [field]: value,
        },
      }));
    };

  /* =======================================================
     JUMLAH HARI TERISI
  ======================================================= */

  const jumlahHariDiisi =
    HARI.filter((hari) => {
      const slot =
        jadwal[hari.key];

      return (
        slot.jamMulai &&
        slot.jamSelesai
      );
    }).length;

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateJadwal = () => {
    for (const hari of HARI) {
      const slot =
        jadwal[hari.key];

      const adaInput =
        slot.jamMulai ||
        slot.jamSelesai;

      if (!adaInput) {
        continue;
      }

      if (
        !slot.jamMulai ||
        !slot.jamSelesai
      ) {
        return `Lengkapi jam jadwal hari ${hari.label}.`;
      }

      if (
        slot.jamSelesai <=
        slot.jamMulai
      ) {
        return `Jam selesai hari ${hari.label} harus lebih besar dari jam mulai.`;
      }
    }

    return "";
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    /* -----------------------------------------------
       VALIDASI KELAS MAPEL
    ------------------------------------------------ */

    if (!selectedKelasMapelId) {
      setError(
        "Kelas, mata pelajaran, dan guru wajib dipilih."
      );

      return;
    }

    /* -----------------------------------------------
       VALIDASI HARI
    ------------------------------------------------ */

    if (jumlahHariDiisi === 0) {
      setError(
        "Isi jadwal untuk minimal satu hari."
      );

      return;
    }

    /* -----------------------------------------------
       VALIDASI JAM
    ------------------------------------------------ */

    const validationError =
      validateJadwal();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    try {
      setSaving(true);

      console.log(
        "========== CREATE JADWAL =========="
      );

      console.log(
        "Kelas Mapel ID:",
        selectedKelasMapelId
      );

      console.log(
        "Guru:",
        kelasMapelTerpilih?.guruNama
      );

      console.log(
        "Mapel:",
        kelasMapelTerpilih?.mapelNama
      );

      console.log(
        "Kelas:",
        kelasMapelTerpilih?.kelasNama
      );

      console.log(
        "Ruangan:",
        ruangan
      );

      console.log(
        "Jadwal:",
        jadwal
      );

      console.log(
        "==================================="
      );

      /* -----------------------------------------------
         BUAT JADWAL SATU PER SATU
      ------------------------------------------------ */

      const hariTerisi =
        HARI.filter((hari) => {
          const slot =
            jadwal[hari.key];

          return (
            slot.jamMulai &&
            slot.jamSelesai
          );
        });

      const hasil =
        await Promise.all(
          hariTerisi.map(
            async (hari) => {
              const slot =
                jadwal[hari.key];

              const payload = {
                kelasMapelId:
                  selectedKelasMapelId,

                hari:
                  hari.key,

                jamMulai:
                  slot.jamMulai,

                jamSelesai:
                  slot.jamSelesai,

                ruangan:
                  ruangan.trim() ||
                  null,
              };

              console.log(
                `CREATE ${hari.label}:`,
                payload
              );

              return createJadwalMengajar(
                payload
              );
            }
          )
        );

      console.log(
        "HASIL CREATE:",
        hasil
      );

      setSuccess(true);

      setTimeout(() => {
        router.push(
          "/admin/guru/jadwal-mengajar"
        );
      }, 900);
    } catch (err) {
      console.error(
        "Error create jadwal:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal menambahkan jadwal mengajar."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setSelectedKelasMapelId("");

    setJadwal(
      emptyJadwal()
    );

    setRuangan("");

    setError("");

    setSuccess(false);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        active="guruJadwalMengajar"
        setActive={() => {}}
        collapsed={
          isCollapsed
        }
        setCollapsed={
          setIsCollapsed
        }
        role="admin"
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}

        <Header
          toggleSidebar={
            toggleSidebar
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">

            <div className="space-y-6">

              {/* =================================================
                  TOP HEADER
              ================================================== */}

              <section>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/guru/jadwal-mengajar"
                    )
                  }
                  className="mb-4 inline-flex items-center gap-2 text-xs font-semibold theme-text-muted transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft
                    size={15}
                  />

                  Kembali ke Jadwal Mengajar
                </button>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                  <div className="flex min-w-0 items-start gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl theme-primary shadow-sm">
                      <CalendarClock
                        size={22}
                      />
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                          Tambah Jadwal Mengajar
                        </h1>

                        <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold theme-sidebar-active theme-border">
                          Akademik
                        </span>

                      </div>

                      <p className="mt-1 max-w-2xl text-xs leading-5 theme-text-muted sm:text-sm">
                        Tentukan guru, mata pelajaran, kelas, ruangan, dan waktu mengajar.
                      </p>

                    </div>

                  </div>

                  {/* SUMMARY */}

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">

                    <div className="rounded-lg border px-4 py-2.5 shadow-sm theme-card theme-border">

                      <p className="text-[10px] uppercase tracking-wide theme-text-placeholder">
                        Hari Terisi
                      </p>

                      <p className="mt-0.5 text-sm font-bold theme-text">
                        {jumlahHariDiisi}

                        <span className="ml-1 text-xs font-normal theme-text-placeholder">
                          / {HARI.length}
                        </span>
                      </p>

                    </div>

                    <div className="rounded-lg border px-4 py-2.5 shadow-sm theme-card theme-border">

                      <p className="text-[10px] uppercase tracking-wide theme-text-placeholder">
                        Kelas
                      </p>

                      <p className="mt-0.5 max-w-[150px] truncate text-sm font-bold theme-text">
                        {kelasMapelTerpilih?.kelasNama ||
                          "Belum dipilih"}
                      </p>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  LOADING
              ================================================== */}

              {loadingData && (
                <div className="flex items-center gap-3 rounded-xl border p-4 theme-info theme-border">

                  <Loader2
                    size={18}
                    className="animate-spin text-[var(--color-info)]"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[var(--color-info)]">
                      Mengambil data kelas mapel...
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-info)]">
                      Data guru, mata pelajaran, dan kelas sedang dimuat dari backend.
                    </p>
                  </div>

                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border p-4 theme-success theme-border">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-card">
                    <CheckCircle2
                      size={18}
                      className="text-[var(--color-success)]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[var(--color-success)]">
                      Jadwal berhasil ditambahkan
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-success)]">
                      Mengalihkan ke daftar jadwal mengajar...
                    </p>
                  </div>

                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border p-4 theme-danger theme-border">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-card">
                    <AlertCircle
                      size={18}
                      className="text-[var(--color-danger)]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-[var(--color-danger)]">
                      Data belum dapat diproses
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--color-danger)]">
                      {error}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="rounded-lg p-1 text-[var(--color-danger)] transition hover:bg-[var(--color-danger-background)]"
                  >
                    <X
                      size={16}
                    />
                  </button>

                </div>
              )}

              {/* =================================================
                  MAIN GRID
              ================================================== */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">

                {/* =================================================
                    FORM
                ================================================== */}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="min-w-0 overflow-hidden rounded-xl border shadow-sm theme-card theme-border"
                >

                  {/* FORM HEADER */}

                  <div className="border-b px-5 py-5 sm:px-6 theme-border-soft">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info">
                        <School
                          size={17}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <div>

                        <h2 className="text-sm font-bold theme-text">
                          Informasi Jadwal
                        </h2>

                        <p className="mt-1 text-xs theme-text-muted">
                          Pilih relasi kelas, mata pelajaran, dan guru yang sudah terdaftar.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      KELAS MAPEL
                  ================================================== */}

                  <div className="p-5 sm:p-6">

                    <SearchableSelect
                      label="Kelas / Mata Pelajaran / Guru"
                      icon={Users}
                      value={
                        selectedKelasMapelId
                      }
                      onChange={
                        setSelectedKelasMapelId
                      }
                      options={
                        kelasMapelOptions
                      }
                      placeholder={
                        loadingData
                          ? "Memuat data..."
                          : "Pilih kelas, mata pelajaran, dan guru..."
                      }
                      disabled={
                        saving ||
                        loadingData
                      }
                      renderOption={(
                        item
                      ) => (
                        <div className="flex min-w-0 flex-1 items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info">
                            <BookMarked
                              size={15}
                              className="text-[var(--color-primary)]"
                            />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-bold theme-text">
                              {
                                item.mapelNama
                              }
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">

                              <span className="text-[10px] font-medium theme-text-muted">
                                Kelas:{" "}
                                {
                                  item.kelasNama
                                }
                              </span>

                              <span className="theme-text-placeholder">
                                •
                              </span>

                              <span className="text-[10px] theme-text-muted">
                                Guru:{" "}
                                {
                                  item.guruNama
                                }
                              </span>

                            </div>

                            {item.mapelKode && (
                              <p className="mt-1 text-[9px] theme-text-placeholder">
                                Kode Mapel:{" "}
                                {
                                  item.mapelKode
                                }
                              </p>
                            )}

                          </div>

                        </div>
                      )}
                    />

                    {/* DETAIL SELECTED */}

                    {kelasMapelTerpilih && (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                        <div className="rounded-lg border p-3 theme-card-soft theme-border">

                          <div className="flex items-center gap-2">

                            <User
                              size={14}
                              className="text-[var(--color-primary)]"
                            />

                            <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                              Guru
                            </p>

                          </div>

                          <p className="mt-1.5 truncate text-xs font-bold theme-text">
                            {
                              kelasMapelTerpilih.guruNama
                            }
                          </p>

                          {kelasMapelTerpilih.guruNip && (
                            <p className="mt-0.5 text-[9px] theme-text-placeholder">
                              NIP:{" "}
                              {
                                kelasMapelTerpilih.guruNip
                              }
                            </p>
                          )}

                        </div>

                        <div className="rounded-lg border p-3 theme-card-soft theme-border">

                          <div className="flex items-center gap-2">

                            <BookMarked
                              size={14}
                              className="text-[var(--color-primary)]"
                            />

                            <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                              Mata Pelajaran
                            </p>

                          </div>

                          <p className="mt-1.5 truncate text-xs font-bold theme-text">
                            {
                              kelasMapelTerpilih.mapelNama
                            }
                          </p>

                          {kelasMapelTerpilih.mapelKode && (
                            <p className="mt-0.5 text-[9px] theme-text-placeholder">
                              Kode:{" "}
                              {
                                kelasMapelTerpilih.mapelKode
                              }
                            </p>
                          )}

                        </div>

                        <div className="rounded-lg border p-3 theme-card-soft theme-border">

                          <div className="flex items-center gap-2">

                            <School
                              size={14}
                              className="text-[var(--color-primary)]"
                            />

                            <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                              Kelas
                            </p>

                          </div>

                          <p className="mt-1.5 truncate text-xs font-bold theme-text">
                            {
                              kelasMapelTerpilih.kelasNama
                            }
                          </p>

                        </div>

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      RUANGAN
                  ================================================== */}

                  <div className="border-y px-5 py-4 sm:px-6 theme-card-soft theme-border">

                    <div className="max-w-xl">

                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">

                        <DoorOpen
                          size={14}
                          className="theme-text-muted"
                        />

                        Ruangan

                        <span className="text-[10px] font-normal theme-text-placeholder">
                          (opsional)
                        </span>

                      </label>

                      <input
                        type="text"
                        value={ruangan}
                        onChange={(e) =>
                          setRuangan(
                            e.target.value
                          )
                        }
                        disabled={
                          saving
                        }
                        placeholder="Contoh: Lab Komputer 1 / Ruang 201"
                        className="h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition theme-input focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 disabled:opacity-70"
                      />

                      <p className="mt-1.5 text-[10px] theme-text-placeholder">
                        Ruangan ini akan digunakan untuk semua hari yang kamu isi.
                      </p>

                    </div>

                  </div>

                  {/* =================================================
                      JADWAL HEADER
                  ================================================== */}

                  <div className="border-b px-5 py-4 sm:px-6 theme-border-soft theme-card">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <h2 className="text-sm font-bold theme-text">
                          Jadwal Mingguan
                        </h2>

                        <p className="mt-1 text-xs theme-text-muted">
                          Isi waktu pada hari yang memiliki jadwal.
                        </p>

                      </div>

                      <div className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold theme-card-soft theme-border theme-text-secondary">

                        <Clock3
                          size={13}
                          className="text-[var(--color-primary)]"
                        />

                        {jumlahHariDiisi} hari terisi

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      DAYS
                  ================================================== */}

                  <div className="p-5 sm:p-6">

                    <div className="space-y-3">

                      {HARI.map(
                        (hari) => {
                          const slot =
                            jadwal[
                              hari.key
                            ];

                          const terisi =
                            Boolean(
                              slot.jamMulai &&
                              slot.jamSelesai
                            );

                          const sebagianDiisi =
                            Boolean(
                              slot.jamMulai ||
                              slot.jamSelesai
                            );

                          return (
                            <div
                              key={
                                hari.key
                              }
                              className={`rounded-xl border p-3.5 transition sm:p-4 ${
                                terisi
                                  ? "theme-sidebar-active theme-border"
                                  : sebagianDiisi
                                  ? "theme-warning theme-border"
                                  : "theme-card theme-border"
                              }`}
                            >

                              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)] xl:items-center">

                                {/* HARI */}

                                <div className="flex items-center gap-3">

                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                      terisi
                                        ? "theme-primary"
                                        : "theme-card-soft theme-text-muted"
                                    }`}
                                  >
                                    <CalendarDays
                                      size={16}
                                    />
                                  </div>

                                  <div>

                                    <p className="text-xs font-bold theme-text">
                                      {
                                        hari.label
                                      }
                                    </p>

                                    <p
                                      className={`mt-0.5 text-[10px] ${
                                        terisi
                                          ? "text-[var(--color-primary)]"
                                          : sebagianDiisi
                                          ? "text-[var(--color-warning)]"
                                          : "theme-text-placeholder"
                                      }`}
                                    >
                                      {terisi
                                        ? "Jadwal terisi"
                                        : sebagianDiisi
                                        ? "Belum lengkap"
                                        : "Tidak ada jadwal"}
                                    </p>

                                  </div>

                                </div>

                                {/* MULAI */}

                                <div>

                                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                                    Jam Mulai
                                  </label>

                                  <input
                                    type="time"
                                    value={
                                      slot.jamMulai
                                    }
                                    onChange={handleSlotChange(
                                      hari.key,
                                      "jamMulai"
                                    )}
                                    disabled={
                                      saving
                                    }
                                    className="h-10 w-full rounded-lg border px-3 text-xs outline-none transition theme-input focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 disabled:opacity-70"
                                  />

                                </div>

                                {/* SELESAI */}

                                <div>

                                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                                    Jam Selesai
                                  </label>

                                  <input
                                    type="time"
                                    value={
                                      slot.jamSelesai
                                    }
                                    onChange={handleSlotChange(
                                      hari.key,
                                      "jamSelesai"
                                    )}
                                    disabled={
                                      saving
                                    }
                                    className="h-10 w-full rounded-lg border px-3 text-xs outline-none transition theme-input focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 disabled:opacity-70"
                                  />

                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      FORM FOOTER
                  ================================================== */}

                  <div className="border-t px-5 py-4 sm:px-6 theme-border theme-card-soft">

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">

                      <button
                        type="button"
                        onClick={
                          handleReset
                        }
                        disabled={
                          saving
                        }
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition theme-card theme-border theme-text-secondary theme-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reset Form
                      </button>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row">

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/admin/guru/jadwal-mengajar"
                            )
                          }
                          disabled={
                            saving
                          }
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border px-5 py-2 text-xs font-semibold transition theme-card theme-border theme-text-secondary theme-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={
                            saving ||
                            success ||
                            loadingData ||
                            !selectedKelasMapelId
                          }
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold shadow-sm transition theme-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >

                          {saving ? (
                            <>
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />

                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save
                                size={15}
                              />

                              Simpan Jadwal
                            </>
                          )}

                        </button>

                      </div>

                    </div>

                  </div>

                </form>

                {/* =================================================
                    SIDE PANEL
                ================================================== */}

                <aside className="min-w-0 space-y-5">

                  {/* =================================================
                      PREVIEW
                  ================================================== */}

                  <section className="overflow-hidden rounded-xl border shadow-sm theme-card theme-border">

                    <div className="border-b px-5 py-4 theme-border-soft">

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <h2 className="text-sm font-bold theme-text">
                            Pratinjau Jadwal
                          </h2>

                          <p className="mt-1 text-[11px] theme-text-muted">
                            Ringkasan data yang akan disimpan.
                          </p>

                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg theme-info">
                          <CalendarClock
                            size={17}
                            className="text-[var(--color-primary)]"
                          />
                        </div>

                      </div>

                    </div>

                    <div className="p-5">

                      {/* GURU */}

                      <div className="flex items-center gap-3 pb-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full theme-primary text-xs font-bold">
                          {kelasMapelTerpilih
                            ? getInitials(
                                kelasMapelTerpilih.guruNama
                              )
                            : "GU"}
                        </div>

                        <div className="min-w-0">

                          <p className="text-[10px] font-bold uppercase tracking-wide theme-text-placeholder">
                            Guru
                          </p>

                          <p className="mt-0.5 truncate text-sm font-bold theme-text">
                            {kelasMapelTerpilih
                              ?.guruNama ||
                              "Belum dipilih"}
                          </p>

                          {kelasMapelTerpilih?.guruNip && (
                            <p className="mt-0.5 text-[10px] theme-text-placeholder">
                              NIP:{" "}
                              {
                                kelasMapelTerpilih.guruNip
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      {/* MAPEL */}

                      <div className="rounded-lg border p-3.5 theme-card-soft theme-border">

                        <div className="flex items-start gap-2.5">

                          <BookMarked
                            size={15}
                            className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                          />

                          <div className="min-w-0">

                            <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                              Mata Pelajaran
                            </p>

                            <p className="mt-1 text-xs font-bold theme-text">
                              {kelasMapelTerpilih
                                ?.mapelNama ||
                                "Belum dipilih"}
                            </p>

                            {kelasMapelTerpilih?.mapelKode && (
                              <p className="mt-0.5 text-[10px] theme-text-placeholder">
                                Kode:{" "}
                                {
                                  kelasMapelTerpilih.mapelKode
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* KELAS */}

                      <div className="mt-3 rounded-lg border p-3.5 theme-card-soft theme-border">

                        <div className="flex items-start gap-2.5">

                          <School
                            size={15}
                            className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                          />

                          <div className="min-w-0">

                            <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                              Kelas
                            </p>

                            <p className="mt-1 text-xs font-bold theme-text">
                              {kelasMapelTerpilih
                                ?.kelasNama ||
                                "Belum dipilih"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* RUANGAN */}

                      <div className="mt-3 rounded-lg border p-3.5 theme-card-soft theme-border">

                        <div className="flex items-start gap-2.5">

                          <DoorOpen
                            size={15}
                            className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                          />

                          <div className="min-w-0">

                            <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-placeholder">
                              Ruangan
                            </p>

                            <p className="mt-1 truncate text-xs font-bold theme-text">
                              {ruangan.trim() ||
                                "Belum diisi"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* DAYS PREVIEW */}

                      <div className="mt-4 space-y-2">

                        {HARI.map(
                          (hari) => {
                            const slot =
                              jadwal[
                                hari.key
                              ];

                            const terisi =
                              Boolean(
                                slot.jamMulai &&
                                slot.jamSelesai
                              );

                            return (
                              <div
                                key={
                                  hari.key
                                }
                                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
                                  terisi
                                    ? "theme-sidebar-active theme-border"
                                    : "theme-card theme-border-soft"
                                }`}
                              >

                                <div className="flex items-center gap-2">

                                  <div
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      terisi
                                        ? "bg-[var(--color-primary)]"
                                        : "bg-[var(--color-text-placeholder)]"
                                    }`}
                                  />

                                  <span className="text-[11px] font-semibold theme-text-secondary">
                                    {
                                      hari.label
                                    }
                                  </span>

                                </div>

                                {terisi ? (
                                  <span className="max-w-[190px] truncate text-right text-[10px] font-semibold theme-text">

                                    {
                                      slot.jamMulai
                                    }

                                    {" – "}

                                    {
                                      slot.jamSelesai
                                    }

                                    {" · "}

                                    {
                                      kelasMapelTerpilih?.kelasNama ||
                                      "-"
                                    }

                                  </span>
                                ) : (
                                  <span className="text-[10px] theme-text-placeholder">
                                    —
                                  </span>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                  </section>

                  {/* =================================================
                      INFORMATION
                  ================================================== */}

                  <section className="rounded-xl border p-5 theme-info theme-border">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-card shadow-sm">
                        <Info
                          size={17}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-xs font-bold theme-text">
                          Informasi Pengisian
                        </h2>

                        <div className="mt-3 space-y-2.5">

                          <div className="flex items-start gap-2">

                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

                            <p className="text-[11px] leading-5 theme-text-secondary">
                              Data guru, mata pelajaran, dan kelas diambil dari relasi Kelas Mapel.
                            </p>

                          </div>

                          <div className="flex items-start gap-2">

                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

                            <p className="text-[11px] leading-5 theme-text-secondary">
                              Satu hari yang diisi akan membuat satu record jadwal di backend.
                            </p>

                          </div>

                          <div className="flex items-start gap-2">

                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

                            <p className="text-[11px] leading-5 theme-text-secondary">
                              Jam selesai harus lebih besar dari jam mulai.
                            </p>

                          </div>

                          <div className="flex items-start gap-2">

                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

                            <p className="text-[11px] leading-5 theme-text-secondary">
                              Backend otomatis menolak jadwal guru yang bentrok.
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* =================================================
                      COMPLETION
                  ================================================== */}

                  <section className="rounded-xl border p-5 shadow-sm theme-card theme-border">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="text-[10px] font-bold uppercase tracking-wide theme-text-placeholder">
                          Kelengkapan
                        </p>

                        <p className="mt-1 text-sm font-bold theme-text">
                          {jumlahHariDiisi} /{" "}
                          {HARI.length} hari
                        </p>

                      </div>

                      <CheckCircle2
                        size={21}
                        className={
                          jumlahHariDiisi >
                          0
                            ? "text-[var(--color-primary)]"
                            : "theme-text-placeholder"
                        }
                      />

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">

                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                        style={{
                          width: `${
                            (jumlahHariDiisi /
                              HARI.length) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                    <p className="mt-2 text-[10px] theme-text-placeholder">

                      {jumlahHariDiisi ===
                      0
                        ? "Belum ada jadwal yang diisi."
                        : jumlahHariDiisi ===
                          HARI.length
                        ? "Semua hari telah memiliki jadwal."
                        : "Beberapa hari masih dapat diisi."}

                    </p>

                  </section>

                </aside>

              </div>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <footer className="pb-3 pt-1 text-center">

                <p className="text-[10px] theme-text-placeholder">
                  © 2026 SmartSchool • Tambah Jadwal Mengajar
                </p>

              </footer>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}