"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import { getFasilitas } from "@/services/sarpras.service";

import {
  Building2,
  Search,
  Plus,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wrench,
  XCircle,
  LayoutGrid,
  Filter,
  X,
} from "lucide-react";

const kondisiStyle = {
  baik: {
    label: "Baik",
    text: "theme-success",
    background:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
  },
  "rusak ringan": {
    label: "Rusak Ringan",
    text: "theme-warning",
    background:
      "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
  },
  "rusak berat": {
    label: "Rusak Berat",
    text: "theme-danger",
    background:
      "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]",
  },
};

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

function extractFasilitas(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

function formatKapasitas(value) {
  if (value === null || value === undefined || value === "") {
    return "Kapasitas tidak tersedia";
  }

  if (typeof value === "number" || !Number.isNaN(Number(value))) {
    return `${Number(value).toLocaleString("id-ID")} orang`;
  }

  return String(value);
}

function getKondisi(value) {
  const key = String(value || "").trim().toLowerCase();

  return (
    kondisiStyle[key] || {
      label: value || "Belum ditentukan",
      text: "theme-text-secondary",
      background:
        "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-text)_15%,transparent)]",
    }
  );
}

export default function FasilitasPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fasilitasList, setFasilitasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [kondisiFilter, setKondisiFilter] = useState("Semua");

  const fetchFasilitas = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getFasilitas();

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal mengambil data fasilitas."
        );
      }

      const data = extractFasilitas(response);

      setFasilitasList(data.filter((item) => !item.dihapusPada));
    } catch (err) {
      console.error("Gagal mengambil fasilitas:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil data fasilitas."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFasilitas();
  }, [fetchFasilitas]);

  const kategoriOptions = useMemo(() => {
    const kategoriUnik = [
      ...new Set(
        fasilitasList.map((item) => item.kategori).filter(Boolean)
      ),
    ];

    return ["Semua", ...kategoriUnik];
  }, [fasilitasList]);

  const kondisiOptions = useMemo(() => {
    const kondisiUnik = [
      ...new Set(
        fasilitasList.map((item) => item.kondisi).filter(Boolean)
      ),
    ];

    return ["Semua", ...kondisiUnik];
  }, [fasilitasList]);

  const statistik = useMemo(() => {
    const total = fasilitasList.length;

    const baik = fasilitasList.filter(
      (item) => String(item.kondisi || "").toLowerCase() === "baik"
    ).length;

    const rusakRingan = fasilitasList.filter(
      (item) =>
        String(item.kondisi || "").toLowerCase() === "rusak ringan"
    ).length;

    const rusakBerat = fasilitasList.filter(
      (item) =>
        String(item.kondisi || "").toLowerCase() === "rusak berat"
    ).length;

    return {
      total,
      baik,
      rusak: rusakRingan + rusakBerat,
      rusakRingan,
      rusakBerat,
    };
  }, [fasilitasList]);

  const filteredList = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return fasilitasList.filter((item) => {
      const matchSearch =
        String(item.nama || "").toLowerCase().includes(keyword) ||
        String(item.lokasi || "").toLowerCase().includes(keyword) ||
        String(item.kategori || "").toLowerCase().includes(keyword);

      const matchKategori =
        kategoriFilter === "Semua" ||
        item.kategori === kategoriFilter;

      const matchKondisi =
        kondisiFilter === "Semua" ||
        item.kondisi === kondisiFilter;

      return matchSearch && matchKategori && matchKondisi;
    });
  }, [fasilitasList, search, kategoriFilter, kondisiFilter]);

  const handleOpenDetail = (id) => {
    if (!id) return;

    router.push(`/admin/sarpras/fasilitas/${id}`);
  };

  const notifications = [];

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="adminSarpras"
        active="fasilitas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setSidebarOpen((prev) => !prev)}
            notifications={notifications}
            user={{
              name: "Admin Sarpras",
              email: "adminsarpras@smartschool.com",
              avatar: "SP",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                    Sarana &amp; Prasarana
                  </p>

                  <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">
                    Fasilitas
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Kelola data fasilitas sekolah beserta kondisi dan
                    lokasinya.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchFasilitas(true)}
                    disabled={refreshing || loading}
                    className="theme-card theme-border inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {refreshing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/sarpras/fasilitas/tambah")
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-95 ${themePrimaryGradient} ${themePrimaryShadow}`}
                  >
                    <Plus size={17} className="text-white" />
                    <span className="text-white">Tambah Fasilitas</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="theme-card theme-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={20}
                      className="theme-danger mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="theme-text text-sm font-semibold">
                        Gagal memuat data fasilitas
                      </p>
                      <p className="theme-text-secondary mt-1 text-sm">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchFasilitas()}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                <div
                  className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-secondary text-sm">
                        Total Fasilitas
                      </p>
                      <p className="theme-text mt-2 text-2xl font-bold">
                        {loading ? "..." : statistik.total}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${themePrimarySoft}`}>
                      <LayoutGrid size={23} className="theme-primary" />
                    </div>
                  </div>
                  <p className="theme-text-muted mt-3 text-xs">
                    Seluruh fasilitas terdaftar
                  </p>
                </div>

                <div
                  className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-secondary text-sm">
                        Kondisi Baik
                      </p>
                      <p className="theme-text mt-2 text-2xl font-bold">
                        {loading ? "..." : statistik.baik}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] p-3">
                      <CheckCircle2
                        size={23}
                        className="theme-success"
                      />
                    </div>
                  </div>
                  <p className="theme-text-muted mt-3 text-xs">
                    Fasilitas dalam kondisi baik
                  </p>
                </div>

                <div
                  className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-secondary text-sm">
                        Rusak Ringan
                      </p>
                      <p className="theme-text mt-2 text-2xl font-bold">
                        {loading ? "..." : statistik.rusakRingan}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-3">
                      <Wrench size={23} className="theme-warning" />
                    </div>
                  </div>
                  <p className="theme-text-muted mt-3 text-xs">
                    Membutuhkan perbaikan ringan
                  </p>
                </div>

                <div
                  className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-secondary text-sm">
                        Rusak Berat
                      </p>
                      <p className="theme-text mt-2 text-2xl font-bold">
                        {loading ? "..." : statistik.rusakBerat}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] p-3">
                      <XCircle size={23} className="theme-danger" />
                    </div>
                  </div>
                  <p className="theme-text-muted mt-3 text-xs">
                    Membutuhkan penanganan lebih lanjut
                  </p>
                </div>
              </div>

              <div
                className={`theme-card theme-border rounded-2xl border p-4 sm:p-5 ${themeCardShadow}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Filter size={17} className="theme-primary" />
                  <h2 className="theme-text text-sm font-semibold">
                    Pencarian dan Filter
                  </h2>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama, lokasi, atau kategori fasilitas..."
                      className={`theme-input theme-text w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm outline-none transition-colors ${themeFocus}`}
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2"
                        aria-label="Hapus pencarian"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="relative lg:w-56">
                    <SlidersHorizontal
                      size={15}
                      className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <select
                      value={kategoriFilter}
                      onChange={(e) =>
                        setKategoriFilter(e.target.value)
                      }
                      className={`theme-input theme-text w-full appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm outline-none ${themeFocus}`}
                    >
                      {kategoriOptions.map((kategori) => (
                        <option key={kategori} value={kategori}>
                          {kategori === "Semua"
                            ? "Semua Kategori"
                            : kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative lg:w-52">
                    <select
                      value={kondisiFilter}
                      onChange={(e) =>
                        setKondisiFilter(e.target.value)
                      }
                      className={`theme-input theme-text w-full appearance-none rounded-xl border px-3 py-2.5 text-sm outline-none ${themeFocus}`}
                    >
                      {kondisiOptions.map((kondisi) => (
                        <option key={kondisi} value={kondisi}>
                          {kondisi === "Semua"
                            ? "Semua Kondisi"
                            : kondisi}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(search ||
                    kategoriFilter !== "Semua" ||
                    kondisiFilter !== "Semua") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setKategoriFilter("Semua");
                        setKondisiFilter("Semua");
                      }}
                      className="theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                    >
                      <X size={15} />
                      Reset
                    </button>
                  )}
                </div>

                <div className="theme-text-muted mt-3 text-xs">
                  Menampilkan {filteredList.length} dari{" "}
                  {fasilitasList.length} fasilitas
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="theme-text text-base font-semibold">
                    Daftar Fasilitas
                  </h2>
                  <span className="theme-text-muted text-xs">
                    {filteredList.length} data
                  </span>
                </div>

                {loading ? (
                  <div className="theme-card theme-border flex min-h-[280px] flex-col items-center justify-center rounded-2xl border">
                    <Loader2
                      size={34}
                      className="theme-primary animate-spin"
                    />
                    <p className="theme-text-secondary mt-3 text-sm">
                      Mengambil data fasilitas...
                    </p>
                  </div>
                ) : !error && filteredList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {filteredList.map((fasilitas) => {
                      const kondisi = getKondisi(fasilitas.kondisi);

                      return (
                        <button
                          key={fasilitas.id}
                          type="button"
                          onClick={() =>
                            handleOpenDetail(fasilitas.id)
                          }
                          className={`theme-card theme-border group overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))] hover:shadow-lg ${themeCardShadow}`}
                        >
                          <div
                            className={`relative flex h-36 items-center justify-center overflow-hidden ${themePrimarySoft}`}
                          >
                            {fasilitas.foto ? (
                              <img
                                src={fasilitas.foto}
                                alt={fasilitas.nama}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-4">
                                <Building2
                                  size={36}
                                  className="theme-primary"
                                />
                              </div>
                            )}

                            <span className="absolute left-3 top-3 rounded-lg bg-[var(--color-card)]/90 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)] shadow-sm">
                              {fasilitas.kategori || "Umum"}
                            </span>
                          </div>

                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="theme-text line-clamp-1 text-sm font-semibold">
                                {fasilitas.nama}
                              </h3>

                              <ChevronRight
                                size={17}
                                className="theme-text-muted mt-0.5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-primary)]"
                              />
                            </div>

                            <div className="theme-text-secondary mt-2 flex items-center gap-1.5 text-xs">
                              <MapPin size={13} className="shrink-0" />
                              <span className="line-clamp-1">
                                {fasilitas.lokasi ||
                                  "Lokasi belum diisi"}
                              </span>
                            </div>

                            <div className="theme-border mt-4 flex items-center justify-between gap-2 border-t pt-3">
                              <span className="theme-text-muted truncate text-xs">
                                {formatKapasitas(fasilitas.kapasitas)}
                              </span>

                              <span
                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${kondisi.text} ${kondisi.background} ${kondisi.border}`}
                              >
                                {kondisi.label}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : !error ? (
                  <div className="theme-card theme-border flex min-h-[280px] flex-col items-center justify-center rounded-2xl border p-6 text-center">
                    <div
                      className={`mb-4 rounded-2xl p-4 ${themePrimarySoft}`}
                    >
                      <Building2
                        size={32}
                        className="theme-primary"
                      />
                    </div>

                    <h3 className="theme-text text-base font-semibold">
                      {fasilitasList.length === 0
                        ? "Belum Ada Fasilitas"
                        : "Fasilitas Tidak Ditemukan"}
                    </h3>

                    <p className="theme-text-secondary mt-2 max-w-sm text-sm">
                      {fasilitasList.length === 0
                        ? "Data fasilitas sekolah belum tersedia. Tambahkan fasilitas untuk mulai mengelola data."
                        : "Tidak ada fasilitas yang sesuai dengan pencarian atau filter yang dipilih."}
                    </p>

                    {fasilitasList.length === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/fasilitas/tambah"
                          )
                        }
                        className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${themePrimaryGradient}`}
                      >
                        <Plus size={16} />
                        Tambah Fasilitas
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setKategoriFilter("Semua");
                          setKondisiFilter("Semua");
                        }}
                        className="theme-primary mt-4 text-sm font-semibold"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}