"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  CalendarDays,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  UserRound,
  BookOpen,
  School,
  Loader2,
  Search,
} from "lucide-react";

import {
  getJadwalMengajarById,
  updateJadwalMengajar,
} from "@/services/jadwalMengajar.service";

import { getKelasMapel } from "@/services/kelasMapel.service";
import { getRuangan } from "@/services/sarpras.service";

const HARI = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

function normalizeArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.ruangan)) return response.ruangan;
  if (Array.isArray(response?.data?.ruangan)) {
    return response.data.ruangan;
  }

  return [];
}

function getKelasName(item) {
  return item?.kelas?.nama || "-";
}

function getMapelName(item) {
  return item?.mataPelajaran?.nama || "-";
}

function getMapelKode(item) {
  return item?.mataPelajaran?.kode || "";
}

function getGuruName(item) {
  return item?.guruPengajar?.namaLengkap || "-";
}

function getGuruNip(item) {
  return item?.guruPengajar?.nip || "";
}

function getRuanganName(item) {
  return item?.nama || item?.namaRuangan || "-";
}

function getRuanganLokasi(item) {
  return item?.lokasi || "";
}

function SearchableKelasMapelSelect({
  value,
  onChange,
  options,
  loading,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const selected = useMemo(
    () =>
      options.find(
        (item) => String(item.id) === String(value)
      ),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return options;

    return options.filter((item) => {
      const kelas = getKelasName(item).toLowerCase();
      const mapel = getMapelName(item).toLowerCase();
      const kode = getMapelKode(item).toLowerCase();
      const guru = getGuruName(item).toLowerCase();

      return (
        kelas.includes(q) ||
        mapel.includes(q) ||
        kode.includes(q) ||
        guru.includes(q)
      );
    });
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleSelect(item) {
    onChange(item.id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex w-full items-center justify-between gap-3
          rounded-xl border theme-border theme-input
          px-4 py-3 text-left text-sm theme-text-secondary
          outline-none transition
          hover:border-[var(--color-primary)]
          focus:border-[var(--color-primary)]
          focus:ring-4 focus:ring-[var(--color-primary)]/10
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
            <School size={16} />
          </span>

          <span className="min-w-0">
            {loading ? (
              <span className="theme-text-muted">
                Memuat data kelas mapel...
              </span>
            ) : selected ? (
              <>
                <span className="block truncate font-semibold theme-text">
                  {getKelasName(selected)} • {getMapelName(selected)}
                </span>

                <span className="block truncate text-xs theme-text-muted">
                  {getGuruName(selected)}
                </span>
              </>
            ) : (
              <span className="theme-text-muted">
                Pilih kelas, mata pelajaran, dan guru
              </span>
            )}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 theme-text-placeholder transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !loading && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border theme-border theme-card shadow-xl">
          <div className="border-b theme-border-soft p-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kelas, mapel, atau guru..."
                autoFocus
                className="
                  h-11 w-full rounded-lg theme-input border
                  pl-9 pr-3 text-sm outline-none transition
                  focus:border-[var(--color-primary)]
                  focus:ring-2 focus:ring-[var(--color-primary)]/10
                "
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <School className="mx-auto mb-2 h-7 w-7 theme-text-placeholder" />
                <p className="text-sm font-medium theme-text-muted">
                  Data tidak ditemukan
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected =
                  String(item.id) === String(value);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`
                      flex w-full items-start gap-3 rounded-lg
                      px-3 py-3 text-left transition
                      ${
                        isSelected
                          ? "theme-sidebar-active"
                          : "theme-table-hover"
                      }
                    `}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-card-soft theme-text-secondary">
                      <School size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold theme-text">
                        {getKelasName(item)} • {getMapelName(item)}
                      </span>

                      <span className="block truncate text-xs theme-text-muted">
                        {getGuruName(item)}
                        {getGuruNip(item)
                          ? ` • ${getGuruNip(item)}`
                          : ""}
                      </span>
                    </span>

                    {isSelected && (
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-[var(--color-primary)]"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchableRuanganSelect({
  value,
  onChange,
  options,
  loading,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const selected = useMemo(
    () =>
      options.find(
        (item) => String(item.id) === String(value)
      ),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return options;

    return options.filter((item) => {
      const nama = getRuanganName(item).toLowerCase();
      const lokasi = getRuanganLokasi(item).toLowerCase();
      const keterangan = (item?.keterangan || "").toLowerCase();

      return (
        nama.includes(q) ||
        lokasi.includes(q) ||
        keterangan.includes(q)
      );
    });
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleSelect(item) {
    onChange(item.id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex w-full items-center justify-between gap-3
          rounded-xl border theme-border theme-input
          px-4 py-3 text-left text-sm theme-text-secondary
          outline-none transition
          hover:border-[var(--color-primary)]
          focus:border-[var(--color-primary)]
          focus:ring-4 focus:ring-[var(--color-primary)]/10
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
            <MapPin size={16} />
          </span>

          <span className="min-w-0">
            {loading ? (
              <span className="theme-text-muted">
                Memuat data ruangan...
              </span>
            ) : selected ? (
              <>
                <span className="block truncate font-semibold theme-text">
                  {getRuanganName(selected)}
                </span>

                <span className="block truncate text-xs theme-text-muted">
                  {getRuanganLokasi(selected) || "Lokasi tidak dicantumkan"}
                </span>
              </>
            ) : (
              <span className="theme-text-muted">
                Pilih ruangan (opsional)
              </span>
            )}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 theme-text-placeholder transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !loading && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border theme-border theme-card shadow-xl">
          <div className="border-b theme-border-soft p-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau lokasi ruangan..."
                autoFocus
                className="
                  h-11 w-full rounded-lg theme-input border
                  pl-9 pr-3 text-sm outline-none transition
                  focus:border-[var(--color-primary)]
                  focus:ring-2 focus:ring-[var(--color-primary)]/10
                "
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              className={`
                mb-1 flex w-full items-center gap-3 rounded-lg
                px-3 py-3 text-left text-sm transition
                ${
                  !value
                    ? "theme-sidebar-active"
                    : "theme-table-hover"
                }
              `}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg theme-card-soft">
                <X size={15} />
              </span>

              <span className="font-medium theme-text">
                Tanpa ruangan
              </span>

              {!value && (
                <CheckCircle2
                  size={17}
                  className="ml-auto text-[var(--color-primary)]"
                />
              )}
            </button>

            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <MapPin className="mx-auto mb-2 h-7 w-7 theme-text-placeholder" />
                <p className="text-sm font-medium theme-text-muted">
                  Ruangan tidak ditemukan
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected =
                  String(item.id) === String(value);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`
                      flex w-full items-start gap-3 rounded-lg
                      px-3 py-3 text-left transition
                      ${
                        isSelected
                          ? "theme-sidebar-active"
                          : "theme-table-hover"
                      }
                    `}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-card-soft theme-text-secondary">
                      <MapPin size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold theme-text">
                        {getRuanganName(item)}
                      </span>

                      <span className="block truncate text-xs theme-text-muted">
                        {getRuanganLokasi(item) || "Lokasi tidak dicantumkan"}
                      </span>
                    </span>

                    {isSelected && (
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-[var(--color-primary)]"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditJadwalMengajarPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [loadingKelasMapel, setLoadingKelasMapel] =
    useState(true);

  const [loadingRuangan, setLoadingRuangan] =
    useState(true);

  const [kelasMapelList, setKelasMapelList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);

  const [form, setForm] = useState({
    kelasMapelId: "",
    hari: "",
    jamMulai: "",
    jamSelesai: "",
    ruanganId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [jadwalResponse, kelasMapelResponse, ruanganResponse] =
          await Promise.all([
            getJadwalMengajarById(id),
            getKelasMapel(),
            getRuangan(),
          ]);

        if (!active) return;

        const jadwal =
          jadwalResponse?.data?.data ||
          jadwalResponse?.data ||
          jadwalResponse;

        const kelasMapelData = normalizeArray(kelasMapelResponse);
        const ruanganData = normalizeArray(ruanganResponse);

        const activeKelasMapel = kelasMapelData.filter(
          (item) =>
            item?.id &&
            item?.status !== "tidak_aktif"
        );

        const activeRuangan = ruanganData.filter(
          (item) =>
            item?.id &&
            !item?.dihapusPada
        );

        setKelasMapelList(activeKelasMapel);
        setRuanganList(activeRuangan);

        let selectedRuanganId =
          jadwal?.ruanganId ||
          jadwal?.ruanganRef?.id ||
          "";

        if (!selectedRuanganId && jadwal?.ruangan) {
          const matchedRoom = activeRuangan.find(
            (item) =>
              getRuanganName(item).toLowerCase() ===
              String(jadwal.ruangan).toLowerCase()
          );

          selectedRuanganId = matchedRoom?.id || "";
        }

        setForm({
          kelasMapelId: jadwal?.kelasMapelId
            ? String(jadwal.kelasMapelId)
            : "",
          hari: jadwal?.hari || "",
          jamMulai: jadwal?.jamMulai?.slice(0, 5) || "",
          jamSelesai: jadwal?.jamSelesai?.slice(0, 5) || "",
          ruanganId: selectedRuanganId
            ? String(selectedRuanganId)
            : "",
        });
      } catch (err) {
        console.error("Gagal mengambil data edit jadwal:", err);

        if (active) {
          setError(
            err?.message ||
              "Gagal mengambil data jadwal mengajar. Silakan coba lagi."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setLoadingKelasMapel(false);
          setLoadingRuangan(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  const selectedKelasMapel = useMemo(
    () =>
      kelasMapelList.find(
        (item) =>
          String(item.id) === String(form.kelasMapelId)
      ),
    [kelasMapelList, form.kelasMapelId]
  );

  const selectedRuangan = useMemo(
    () =>
      ruanganList.find(
        (item) =>
          String(item.id) === String(form.ruanganId)
      ),
    [ruanganList, form.ruanganId]
  );

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!form.kelasMapelId) {
      return "Silakan pilih kelas, mata pelajaran, dan guru.";
    }

    if (!form.hari) {
      return "Silakan pilih hari.";
    }

    if (!form.jamMulai) {
      return "Silakan isi jam mulai.";
    }

    if (!form.jamSelesai) {
      return "Silakan isi jam selesai.";
    }

    if (form.jamSelesai <= form.jamMulai) {
      return "Jam selesai harus lebih besar dari jam mulai.";
    }

    if (form.ruanganId && !selectedRuangan) {
      return "Ruangan yang dipilih tidak ditemukan. Silakan pilih ulang ruangan.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        kelasMapelId: form.kelasMapelId,
        hari: form.hari,
        jamMulai: form.jamMulai,
        jamSelesai: form.jamSelesai,
        ruanganId: form.ruanganId || null,
        ruangan: selectedRuangan
          ? getRuanganName(selectedRuangan)
          : null,
      };

      await updateJadwalMengajar(id, payload);

      setSuccess("Jadwal mengajar berhasil diperbarui.");

      setTimeout(() => {
        router.push("/admin/guru/jadwal-mengajar");
      }, 800);
    } catch (err) {
      console.error("Gagal update jadwal:", err);

      if (err?.status === 409) {
        setError(
          err?.message ||
            "Jadwal guru atau ruangan bentrok dengan jadwal lain."
        );
      } else if (err?.status === 404) {
        setError(
          err?.message ||
            "Jadwal, kelas mapel, atau ruangan tidak ditemukan."
        );
      } else if (err?.status === 403) {
        setError(
          err?.message ||
            "Anda tidak memiliki akses untuk mengubah jadwal ini."
        );
      } else {
        setError(
          err?.message ||
            "Gagal memperbarui jadwal mengajar."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push("/admin/guru/jadwal-mengajar");
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setCollapsed(!collapsed)}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex min-h-full items-center justify-center p-6">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--color-primary)]" />

                <p className="text-sm font-medium theme-text-secondary">
                  Memuat data jadwal...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex w-full min-w-0 flex-col gap-5 p-4 sm:p-6 lg:p-8">
              <div>
                <Link
                  href="/admin/guru/jadwal-mengajar"
                  className="mb-4 inline-flex items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Jadwal Mengajar
                </Link>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-primary shadow-sm">
                    <CalendarDays size={23} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Edit Jadwal Mengajar
                    </h1>

                    <p className="mt-1 text-sm theme-text-muted">
                      Perbarui informasi jadwal mengajar sesuai kebutuhan.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border theme-danger px-4 py-3">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-1 text-sm">{error}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="rounded-lg p-1 transition hover:bg-[var(--color-danger-background)]"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border theme-success px-4 py-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">Berhasil</p>
                    <p className="mt-1 text-sm">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
                  <div className="theme-card min-w-0 rounded-2xl border theme-border shadow-sm">
                    <div className="border-b theme-border-soft px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <CalendarDays
                            size={19}
                            className="text-[var(--color-primary)]"
                          />
                        </div>

                        <div>
                          <h2 className="font-bold theme-text">
                            Informasi Jadwal
                          </h2>

                          <p className="text-xs theme-text-muted">
                            Isi data jadwal yang ingin diperbarui.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-6">
                      <div>
                        <label className="mb-2 block text-sm font-semibold theme-text-secondary">
                          Kelas / Mata Pelajaran / Guru
                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <SearchableKelasMapelSelect
                          value={form.kelasMapelId}
                          onChange={(val) => {
                            setForm((prev) => ({
                              ...prev,
                              kelasMapelId: val,
                            }));

                            setError("");
                            setSuccess("");
                          }}
                          options={kelasMapelList}
                          loading={loadingKelasMapel}
                          disabled={saving}
                        />

                        <p className="mt-2 text-xs theme-text-muted">
                          Data berasal dari Kelas Mapel yang sudah
                          terdaftar pada sekolah. Ketik untuk mencari.
                        </p>
                      </div>

                      {selectedKelasMapel && (
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-xl border theme-border theme-card-soft p-4">
                            <div className="mb-2 flex items-center gap-2 theme-text-muted">
                              <School size={17} />
                              <span className="text-xs font-semibold uppercase">
                                Kelas
                              </span>
                            </div>

                            <p className="font-semibold theme-text">
                              {getKelasName(selectedKelasMapel)}
                            </p>
                          </div>

                          <div className="rounded-xl border theme-border theme-card-soft p-4">
                            <div className="mb-2 flex items-center gap-2 theme-text-muted">
                              <BookOpen size={17} />
                              <span className="text-xs font-semibold uppercase">
                                Mata Pelajaran
                              </span>
                            </div>

                            <p className="font-semibold theme-text">
                              {getMapelName(selectedKelasMapel)}
                            </p>

                            {getMapelKode(selectedKelasMapel) && (
                              <p className="mt-1 text-xs theme-text-muted">
                                Kode: {getMapelKode(selectedKelasMapel)}
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl border theme-border theme-card-soft p-4">
                            <div className="mb-2 flex items-center gap-2 theme-text-muted">
                              <UserRound size={17} />
                              <span className="text-xs font-semibold uppercase">
                                Guru
                              </span>
                            </div>

                            <p className="font-semibold theme-text">
                              {getGuruName(selectedKelasMapel)}
                            </p>

                            {getGuruNip(selectedKelasMapel) && (
                              <p className="mt-1 text-xs theme-text-muted">
                                NIP: {getGuruNip(selectedKelasMapel)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="hari"
                          className="mb-2 block text-sm font-semibold theme-text-secondary"
                        >
                          Hari
                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <select
                            id="hari"
                            name="hari"
                            value={form.hari}
                            onChange={handleChange}
                            disabled={saving}
                            className="
                              w-full appearance-none rounded-xl
                              border theme-border theme-input
                              px-4 py-3 pr-10 text-sm outline-none
                              transition
                              focus:border-[var(--color-primary)]
                              focus:ring-4 focus:ring-[var(--color-primary)]/10
                              disabled:cursor-not-allowed disabled:opacity-60
                            "
                          >
                            <option value="">Pilih hari</option>

                            {HARI.map((item) => (
                              <option
                                key={item.value}
                                value={item.value}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 theme-text-placeholder"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="jamMulai"
                            className="mb-2 block text-sm font-semibold theme-text-secondary"
                          >
                            Jam Mulai
                            <span className="ml-1 text-[var(--color-danger)]">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <Clock3
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-placeholder"
                            />

                            <input
                              id="jamMulai"
                              name="jamMulai"
                              type="time"
                              value={form.jamMulai}
                              onChange={handleChange}
                              disabled={saving}
                              className="
                                w-full rounded-xl border theme-border
                                theme-input py-3 pl-11 pr-4 text-sm
                                outline-none transition
                                focus:border-[var(--color-primary)]
                                focus:ring-4 focus:ring-[var(--color-primary)]/10
                                disabled:cursor-not-allowed disabled:opacity-60
                              "
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="jamSelesai"
                            className="mb-2 block text-sm font-semibold theme-text-secondary"
                          >
                            Jam Selesai
                            <span className="ml-1 text-[var(--color-danger)]">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <Clock3
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-placeholder"
                            />

                            <input
                              id="jamSelesai"
                              name="jamSelesai"
                              type="time"
                              value={form.jamSelesai}
                              onChange={handleChange}
                              disabled={saving}
                              className="
                                w-full rounded-xl border theme-border
                                theme-input py-3 pl-11 pr-4 text-sm
                                outline-none transition
                                focus:border-[var(--color-primary)]
                                focus:ring-4 focus:ring-[var(--color-primary)]/10
                                disabled:cursor-not-allowed disabled:opacity-60
                              "
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold theme-text-secondary">
                          Ruangan
                          <span className="ml-2 text-xs font-normal theme-text-placeholder">
                            (opsional)
                          </span>
                        </label>

                        <SearchableRuanganSelect
                          value={form.ruanganId}
                          onChange={(val) => {
                            setForm((prev) => ({
                              ...prev,
                              ruanganId: val,
                            }));

                            setError("");
                            setSuccess("");
                          }}
                          options={ruanganList}
                          loading={loadingRuangan}
                          disabled={saving}
                        />

                        <p className="mt-2 text-xs theme-text-muted">
                          Pilih ruangan dari data Sarpras. Nama dan lokasi
                          ruangan akan mengikuti data master ruangan.
                        </p>

                        {selectedRuangan && (
                          <div className="mt-3 flex items-start gap-3 rounded-xl border theme-border theme-card-soft p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                              <MapPin
                                size={17}
                                className="text-[var(--color-primary)]"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold theme-text">
                                {getRuanganName(selectedRuangan)}
                              </p>

                              <p className="mt-1 text-xs theme-text-muted">
                                {getRuanganLokasi(selectedRuangan) ||
                                  "Lokasi tidak dicantumkan"}
                              </p>

                              {selectedRuangan.kapasitas != null && (
                                <p className="mt-1 text-xs theme-text-muted">
                                  Kapasitas: {selectedRuangan.kapasitas} orang
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {!loadingRuangan && ruanganList.length === 0 && (
                          <p className="mt-2 text-xs theme-text-muted">
                            Belum ada data ruangan aktif. Kamu tetap bisa
                            menyimpan jadwal tanpa memilih ruangan.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t theme-border theme-card-soft px-6 py-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="
                          inline-flex items-center justify-center gap-2
                          rounded-xl border theme-border theme-card
                          px-5 py-3 text-sm font-semibold
                          theme-text-secondary theme-sidebar-hover
                          transition
                          disabled:cursor-not-allowed disabled:opacity-60
                        "
                      >
                        <X size={18} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving || loadingRuangan || loadingKelasMapel}
                        className="
                          inline-flex items-center justify-center gap-2
                          rounded-xl theme-primary px-5 py-3
                          text-sm font-semibold shadow-sm transition
                          disabled:cursor-not-allowed disabled:opacity-60
                        "
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-5">
                    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg theme-primary">
                          <CalendarDays size={18} />
                        </div>

                        <h3 className="font-bold theme-text">
                          Data yang Diedit
                        </h3>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs font-medium theme-text-muted">
                            Kelas
                          </p>

                          <p className="mt-1 font-semibold theme-text">
                            {selectedKelasMapel
                              ? getKelasName(selectedKelasMapel)
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium theme-text-muted">
                            Mata Pelajaran
                          </p>

                          <p className="mt-1 font-semibold theme-text">
                            {selectedKelasMapel
                              ? getMapelName(selectedKelasMapel)
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium theme-text-muted">
                            Guru
                          </p>

                          <p className="mt-1 font-semibold theme-text">
                            {selectedKelasMapel
                              ? getGuruName(selectedKelasMapel)
                              : "-"}
                          </p>
                        </div>

                        <div className="border-t theme-border-soft pt-3">
                          <p className="text-xs font-medium theme-text-muted">
                            Hari
                          </p>

                          <p className="mt-1 font-semibold capitalize theme-text">
                            {HARI.find(
                              (item) => item.value === form.hari
                            )?.label || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium theme-text-muted">
                            Waktu
                          </p>

                          <p className="mt-1 font-semibold theme-text">
                            {form.jamMulai && form.jamSelesai
                              ? `${form.jamMulai} - ${form.jamSelesai}`
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium theme-text-muted">
                            Ruangan
                          </p>

                          <p className="mt-1 font-semibold theme-text">
                            {selectedRuangan
                              ? getRuanganName(selectedRuangan)
                              : "-"}
                          </p>

                          {selectedRuangan &&
                            getRuanganLokasi(selectedRuangan) && (
                              <p className="mt-1 text-xs theme-text-muted">
                                {getRuanganLokasi(selectedRuangan)}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border theme-border theme-card p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <AlertCircle size={18} />
                        </div>

                        <h3 className="font-bold theme-text">
                          Perhatian
                        </h3>
                      </div>

                      <ul className="space-y-3 text-sm leading-6 theme-text-secondary">
                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-muted)]" />
                          Pastikan jam selesai lebih besar dari jam mulai.
                        </li>

                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-muted)]" />
                          Guru tidak boleh memiliki jadwal yang bentrok.
                        </li>

                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-muted)]" />
                          Ruangan tidak boleh digunakan pada jadwal lain
                          yang waktunya bertabrakan.
                        </li>

                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-muted)]" />
                          Perubahan akan langsung disimpan ke server.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}