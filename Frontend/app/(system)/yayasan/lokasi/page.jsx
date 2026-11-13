"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Users,
  ExternalLink,
  Building2,
  GraduationCap,
  Info,
  Navigation,
} from "lucide-react";

import {
  getSekolahBinaan,
  getDetailSekolahBinaan,
} from "@/services/yayasan.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

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

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

function toCoordinate(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function LokasiSekolahPage() {
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSchools() {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await getSekolahBinaan();
        const payload = unwrapData(response);
        const items = Array.isArray(payload?.items) ? payload.items : [];

        if (!mounted) return;

        setSchools(items);
        setSelectedId(items[0]?.id ?? null);
      } catch (err) {
        if (!mounted) return;

        setLoadError(err?.message || "Gagal mengambil data sekolah binaan.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchSchools();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId || details[selectedId]) return;

    let mounted = true;

    async function fetchDetail() {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const response = await getDetailSekolahBinaan(selectedId);
        const payload = unwrapData(response);

        if (!mounted) return;

        setDetails((prev) => ({
          ...prev,
          [selectedId]: payload?.profil ?? null,
        }));
      } catch (err) {
        if (!mounted) return;

        setDetailError(
          err?.message ||
            "Detail koordinat sekolah gagal dimuat. Peta tidak dapat ditampilkan."
        );
      } finally {
        if (mounted) {
          setDetailLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      mounted = false;
    };
  }, [selectedId, details]);

  const selected = useMemo(
    () => schools.find((item) => item.id === selectedId) ?? null,
    [schools, selectedId]
  );

  const selectedDetail = selectedId ? details[selectedId] : null;

  const filtered = schools.filter((school) => {
    const keyword = search.toLowerCase();

    return (
      String(school?.nama ?? "").toLowerCase().includes(keyword) ||
      String(school?.alamat ?? "").toLowerCase().includes(keyword)
    );
  });

  const totalSiswa = schools.reduce(
    (total, sekolah) => total + Number(sekolah?.statistik?.totalSiswa ?? 0),
    0
  );

  const totalGuru = schools.reduce(
    (total, sekolah) => total + Number(sekolah?.statistik?.totalGuru ?? 0),
    0
  );

  const lintang = toCoordinate(selectedDetail?.lintang);
  const bujur = toCoordinate(selectedDetail?.bujur);
  const hasCoordinate = lintang !== null && bujur !== null;

  const addressQuery = [selected?.nama, selected?.alamat]
    .filter(Boolean)
    .join(", ");

  const mapSrc = hasCoordinate
    ? `https://www.google.com/maps?q=${lintang},${bujur}&z=15&output=embed`
    : "";

  const mapLink = hasCoordinate
    ? `https://www.google.com/maps?q=${lintang},${bujur}`
    : `https://www.google.com/maps?q=${encodeURIComponent(
        addressQuery || selected?.nama || ""
      )}`;

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex shrink-0 items-center justify-center rounded-lg p-2 ${themePrimaryGradient} text-white ${themePrimaryShadow}`}
            >
              <MapPin size={18} />
            </div>

            <h1 className="theme-text text-xl font-semibold sm:text-2xl">
              Lokasi Sekolah
            </h1>
          </div>

          <p className="theme-text-secondary ml-[42px] mt-1 text-sm">
            Peta lokasi seluruh sekolah yang dinaungi yayasan
          </p>
        </div>

        {loadError && (
          <div
            className={`rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-3.5`}
          >
            <p className="text-sm font-medium text-[var(--color-warning)]">
              Gagal memuat data sekolah
            </p>

            <p className="theme-text-secondary mt-0.5 text-xs">{loadError}</p>
          </div>
        )}

        {/* Statistik Atas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                <Building2 size={18} className="theme-primary-text" />
              </div>

              <div className="min-w-0">
                <p className="theme-text-secondary text-sm">Total Sekolah</p>
                <p className="theme-text mt-0.5 text-2xl font-bold">
                  {loading ? "-" : schools.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                <Users size={18} className="theme-primary-text" />
              </div>

              <div className="min-w-0">
                <p className="theme-text-secondary text-sm">Total Siswa</p>
                <p className="theme-text mt-0.5 text-2xl font-bold">
                  {loading ? "-" : totalSiswa}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                <GraduationCap size={18} className="theme-primary-text" />
              </div>

              <div className="min-w-0">
                <p className="theme-text-secondary text-sm">Total Guru</p>
                <p className="theme-text mt-0.5 text-2xl font-bold">
                  {loading ? "-" : totalGuru}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar List Sekolah */}
          <div className="w-full shrink-0 space-y-3 lg:w-80 xl:w-[340px]">
            <div className="relative">
              <Search
                size={15}
                className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau alamat sekolah..."
                className={`theme-text-secondary theme-card theme-border w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
              />
            </div>

            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {loading && (
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-xl"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-text) 6%, transparent)",
                      }}
                    />
                  ))}
                </div>
              )}

              {!loading &&
                filtered.map((s) => {
                  const isActive = selectedId === s.id;

                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      type="button"
                      className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
                        isActive
                          ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryShadow}`
                          : `theme-border theme-card ${themeNeutralHover}`
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isActive
                              ? `${themePrimaryGradient} text-white`
                              : `${themeNeutralSurface} theme-text-muted`
                          }`}
                        >
                          <Building2 size={16} />
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isActive
                                ? "text-[var(--color-primary)]"
                                : "theme-text"
                            }`}
                          >
                            {s.nama}
                          </p>

                          <p className="theme-text-muted line-clamp-2 text-xs">
                            {s.alamat || "Alamat belum diisi"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <div
                  className={`theme-card theme-border rounded-xl border ${themeCardShadow} p-8 text-center`}
                >
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${themeNeutralSurface} theme-text-muted`}
                  >
                    <Search size={18} />
                  </div>

                  <p className="theme-text-muted mt-3 text-sm">
                    Tidak ada sekolah yang cocok.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Area Peta & Detail */}
          <div className="min-w-0 flex-1 space-y-4">
            {!selected ? (
              <div
                className={`theme-card theme-border rounded-xl border p-8 text-center ${themeCardShadow}`}
              >
                <MapPin
                  size={32}
                  className="mx-auto text-[var(--color-text-muted)]"
                />

                <p className="theme-text-secondary mt-2 text-sm font-medium">
                  Pilih sekolah untuk melihat lokasi
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`theme-card theme-border overflow-hidden rounded-xl border ${themeCardShadow}`}
                >
                  {hasCoordinate ? (
                    <iframe
                      title={`Peta Lokasi ${selected.nama}`}
                      src={mapSrc}
                      className="h-[300px] w-full sm:h-80 lg:h-[400px] xl:h-[480px]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-[300px] w-full flex-col items-center justify-center p-6 text-center sm:h-80 lg:h-[400px] xl:h-[480px]">
                      {detailLoading ? (
                        <>
                          <Navigation
                            size={30}
                            className="theme-text-muted animate-pulse"
                          />

                          <p className="theme-text-secondary mt-2 text-sm">
                            Memuat koordinat sekolah...
                          </p>
                        </>
                      ) : (
                        <>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-full border ${themeWarningSurface} ${themeWarningBorder}`}
                          >
                            <MapPin
                              size={24}
                              className="text-[var(--color-warning)]"
                            />
                          </div>

                          <p className="theme-text mt-3 text-sm font-medium">
                            Koordinat peta belum tersedia
                          </p>

                          <p className="theme-text-secondary mt-1 max-w-md text-xs">
                            Backend belum menyimpan titik lintang/bujur untuk
                            sekolah ini. Gunakan tautan alamat di bawah untuk
                            membuka lokasi di Google Maps.
                          </p>

                          {detailError && (
                            <p className="mt-2 text-xs text-[var(--color-warning)]">
                              {detailError}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`theme-card theme-border rounded-xl border p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="theme-text truncate text-lg font-semibold">
                        {selected.nama}
                      </h2>

                      <p className="theme-text-secondary mt-1 flex items-start gap-1.5 text-sm">
                        <MapPin
                          size={15}
                          className="theme-text-muted mt-0.5 shrink-0"
                        />

                        <span>{selected.alamat || "Alamat belum diisi"}</span>
                      </p>
                    </div>

                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg border ${themePrimarySoftBorder} px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] ${themePrimaryHover} transition-colors`}
                    >
                      <ExternalLink size={14} />
                      <span className="hidden sm:inline">
                        Buka di Google Maps
                      </span>
                      <span className="sm:hidden">Maps</span>
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div
                      className={`flex items-center gap-2 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                    >
                      <Phone
                        size={16}
                        className="theme-text-muted shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="theme-text-muted text-xs">Telepon</p>
                        <p className="theme-text truncate text-sm font-medium">
                          {selected.telepon || "-"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                    >
                      <Users
                        size={16}
                        className="theme-primary-text shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="theme-text-muted text-xs">
                          Jumlah Siswa
                        </p>
                        <p className="theme-text text-sm font-medium">
                          {Number(selected?.statistik?.totalSiswa ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                    >
                      <GraduationCap
                        size={16}
                        className="theme-primary-text shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="theme-text-muted text-xs">
                          Jumlah Guru
                        </p>
                        <p className="theme-text text-sm font-medium">
                          {Number(selected?.statistik?.totalGuru ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-4 flex items-start gap-2 rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} p-3`}
                  >
                    <Info
                      size={14}
                      className="theme-primary-text mt-0.5 shrink-0"
                    />

                    <p className="theme-text-secondary text-xs">
                      Data alamat, telepon, dan jumlah siswa/guru berasal dari
                      endpoint /api/yayasan/sekolah. Titik koordinat diambil
                      dari detail sekolah bila tersedia.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}