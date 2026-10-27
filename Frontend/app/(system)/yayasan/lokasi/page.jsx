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
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

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

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

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

        setLoadError(
          err?.message || "Gagal mengambil data sekolah binaan."
        );
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
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">


        <div>
          <div className="flex items-center gap-2.5">
            <div
              className={`
                p-2
                rounded-lg
                ${themePrimaryGradient}
                text-[var(--color-card)]
                ${themePrimaryShadow}
                flex-shrink-0
              `}
            >
              <MapPin size={18} />
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold theme-text">
              Lokasi Sekolah
            </h1>
          </div>

          <p className="text-sm theme-text-secondary mt-1 ml-[42px]">
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

            <p className="text-xs theme-text-secondary mt-0.5">
              {loadError}
            </p>
          </div>
        )}


        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              p-4
              ${themeSmallShadow}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  ${themePrimarySoft}
                  text-[var(--color-primary)]
                `}
              >
                <Building2 size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm theme-text-secondary">
                  Total Sekolah
                </p>

                <p className="mt-0.5 text-2xl font-bold theme-text">
                  {loading ? "-" : schools.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              p-4
              ${themeSmallShadow}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
                  text-[var(--color-info)]
                "
              >
                <Users size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm theme-text-secondary">
                  Total Siswa
                </p>

                <p className="mt-0.5 text-2xl font-bold text-[var(--color-info)]">
                  {loading ? "-" : totalSiswa}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              p-4
              ${themeSmallShadow}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]
                  text-[var(--color-success)]
                "
              >
                <GraduationCap size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm theme-text-secondary">
                  Total Guru
                </p>

                <p className="mt-0.5 text-2xl font-bold text-[var(--color-success)]">
                  {loading ? "-" : totalGuru}
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="flex flex-col lg:flex-row gap-6">


          <div className="lg:w-80 shrink-0 space-y-3">

            <div className="relative">
              <Search
                size={15}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau alamat sekolah..."
                className={`
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                  text-sm
                  theme-text-secondary
                  theme-card
                  border
                  theme-border
                  rounded-lg
                  outline-none
                  transition-colors
                  ${themeFocus}
                  placeholder:text-[var(--color-text-placeholder)]
                `}
              />
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">

              {loading && (
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 rounded-xl animate-pulse"
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
                      className={`
                        w-full
                        text-left
                        rounded-xl
                        border
                        p-3
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryShadow}`
                            : `theme-border theme-card ${themeNeutralHover}`
                        }
                      `}
                    >
                      <div className="flex items-start gap-2">

                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            ${
                              isActive
                                ? `${themePrimaryGradient} text-[var(--color-card)]`
                                : `${themeNeutralSurface} theme-text-muted`
                            }
                          `}
                        >
                          <Building2 size={16} />
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`
                              text-sm
                              font-semibold
                              truncate
                              ${
                                isActive
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text"
                              }
                            `}
                          >
                            {s.nama}
                          </p>

                          <p className="text-xs theme-text-muted line-clamp-2">
                            {s.alamat || "Alamat belum diisi"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <div
                  className={`
                    theme-card
                    rounded-xl
                    border
                    theme-border
                    ${themeCardShadow}
                    p-8
                    text-center
                  `}
                >
                  <div
                    className={`
                      mx-auto
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      ${themeNeutralSurface}
                      theme-text-muted
                    `}
                  >
                    <Search size={18} />
                  </div>

                  <p className="text-sm theme-text-muted mt-3">
                    Tidak ada sekolah yang cocok.
                  </p>
                </div>
              )}
            </div>
          </div>


          <div className="flex-1 min-w-0 space-y-4">

            {!selected ? (
              <div
                className={`theme-card rounded-xl border theme-border p-8 text-center ${themeCardShadow}`}
              >
                <MapPin
                  size={32}
                  className="mx-auto text-[var(--color-text-muted)]"
                />

                <p className="mt-2 text-sm font-medium theme-text-secondary">
                  Pilih sekolah untuk melihat lokasi
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`
                    overflow-hidden
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    ${themeCardShadow}
                  `}
                >
                  {hasCoordinate ? (
                    <iframe
                      title={`Peta Lokasi ${selected.nama}`}
                      src={mapSrc}
                      className="h-80 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="h-80 w-full flex flex-col items-center justify-center p-6 text-center">
                      {detailLoading ? (
                        <>
                          <Navigation
                            size={30}
                            className="theme-text-muted animate-pulse"
                          />

                          <p className="mt-2 text-sm theme-text-secondary">
                            Memuat koordinat sekolah...
                          </p>
                        </>
                      ) : (
                        <>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-full ${themeWarningSurface} ${themeWarningBorder} border`}
                          >
                            <MapPin
                              size={24}
                              className="text-[var(--color-warning)]"
                            />
                          </div>

                          <p className="mt-3 text-sm font-medium theme-text">
                            Koordinat peta belum tersedia
                          </p>

                          <p className="mt-1 max-w-md text-xs theme-text-secondary">
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
                  className={`
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    p-5
                    ${themeCardShadow}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold theme-text truncate">
                        {selected.nama}
                      </h2>

                      <p className="mt-1 flex items-start gap-1.5 text-sm theme-text-secondary">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 theme-text-muted"
                        />

                        <span>
                          {selected.alamat || "Alamat belum diisi"}
                        </span>
                      </p>
                    </div>

                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        ${themePrimarySoftBorder}
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-[var(--color-primary)]
                        ${themePrimaryHover}
                        transition-colors
                      `}
                    >
                      <ExternalLink size={14} />
                      <span className="hidden sm:inline">
                        Buka di Google Maps
                      </span>
                      <span className="sm:hidden">
                        Maps
                      </span>
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <div
                      className={`
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        ${themeNeutralBorder}
                        ${themeNeutralSurface}
                        p-3
                      `}
                    >
                      <Phone
                        size={16}
                        className="theme-text-muted shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">
                          Telepon
                        </p>

                        <p className="text-sm font-medium theme-text truncate">
                          {selected.telepon || "-"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        ${themeNeutralBorder}
                        ${themeNeutralSurface}
                        p-3
                      `}
                    >
                      <Users
                        size={16}
                        className="text-[var(--color-info)] shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">
                          Jumlah Siswa
                        </p>

                        <p className="text-sm font-medium theme-text">
                          {Number(selected?.statistik?.totalSiswa ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        ${themeNeutralBorder}
                        ${themeNeutralSurface}
                        p-3
                      `}
                    >
                      <GraduationCap
                        size={16}
                        className="text-[var(--color-success)] shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">
                          Jumlah Guru
                        </p>

                        <p className="text-sm font-medium theme-text">
                          {Number(selected?.statistik?.totalGuru ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-4 flex items-start gap-2 rounded-lg border ${themeInfoBorder} ${themeInfoSurface} p-3`}
                  >
                    <Info
                      size={14}
                      className="mt-0.5 shrink-0 text-[var(--color-info)]"
                    />

                    <p className="text-xs theme-text-secondary">
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
