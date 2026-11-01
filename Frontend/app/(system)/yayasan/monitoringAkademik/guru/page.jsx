"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  GraduationCap,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getMonitoringUsers } from "@/services/yayasan.service";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

export default function LaporanGuruPage() {
  const [search, setSearch] = useState("");
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuru = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMonitoringUsers({ peran: "guru" });
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data?.users)
        ? res.data.users
        : [];
      const mapped = raw.map((g) => ({
        id: g.id,
        nama: g.namaLengkap || g.namaPengguna || "Guru",
        nip: g.nip || g.namaPengguna || "-",
        mapel: g.mapel || "Guru Pengajar",
        sekolah: g.sekolah?.nama || "-",
        status: g.status === "aktif" ? "Aktif" : "Nonaktif",
        email: g.email || "-",
        telp: g.nomorTelepon || "-",
      }));
      setGuruList(mapped);
    } catch (err) {
      setError(err?.message || "Gagal memuat data guru yayasan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getMonitoringUsers({ peran: "guru", limit: 100 });
        if (cancelled) return;

        const users = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data?.users)
          ? res.data.users
          : [];
        const mapped = users.map((g) => ({
          id: g.id,
          nama: g.namaLengkap || g.username || "-",
          nip: g.nip || g.namaPengguna || "-",
          mapel: g.mapel || "Guru Pengajar",
          sekolah: g.sekolah?.nama || "-",
          status: g.status === "aktif" ? "Aktif" : "Nonaktif",
          email: g.email || "-",
          telp: g.nomorTelepon || "-",
        }));
        setGuruList(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Gagal memuat data guru yayasan.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGuru = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guruList.filter(
      (g) =>
        g.nama.toLowerCase().includes(q) ||
        g.mapel.toLowerCase().includes(q) ||
        g.sekolah.toLowerCase().includes(q)
    );
  }, [guruList, search]);

  const totalGuru = guruList.length;
  const guruAktif = guruList.filter((g) => g.status === "Aktif").length;
  const guruNonaktif = guruList.filter((g) => g.status !== "Aktif").length;

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
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
                <GraduationCap size={18} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                Laporan Guru
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1 ml-[42px]">
              Data dan status guru di seluruh sekolah
            </p>
          </div>

          <button
            type="button"
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              px-4
              py-2
              text-sm
              font-medium
              bg-[var(--color-primary)]
              text-[var(--color-card)]
              hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,black)]
              ${themePrimaryShadow}
              transition-colors
              shrink-0
            `}
          >
            <Download className="h-4 w-4" />
            Ekspor Data
          </button>
        </div>


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
                <GraduationCap size={18} />
              </div>

              <div>
                <p className="text-sm theme-text-secondary">
                  Total Guru
                </p>

                <p className="mt-1 text-2xl font-semibold theme-text">
                  {totalGuru}
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

              <div>
                <p className="text-sm theme-text-secondary">
                  Guru Aktif
                </p>

                <p className="mt-1 text-2xl font-semibold text-[var(--color-success)]">
                  {guruAktif}
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
                  bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
                  text-[var(--color-warning)]
                "
              >
                <GraduationCap size={18} />
              </div>

              <div>
                <p className="text-sm theme-text-secondary">
                  Guru Cuti
                </p>

                <p className="mt-1 text-2xl font-semibold text-[var(--color-warning)]">
                  {guruCuti}
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="relative max-w-sm">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              theme-text-muted
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, mapel, atau sekolah..."
            className={`
              w-full
              rounded-lg
              border
              theme-border
              theme-card
              py-2
              pl-9
              pr-3
              text-sm
              theme-text-secondary
              outline-none
              transition-colors
              ${themeFocus}
              placeholder:text-[var(--color-text-placeholder)]
            `}
          />
        </div>


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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">

              <thead
                className={`
                  ${themeNeutralSurface}
                  theme-text-secondary
                  text-xs
                  uppercase
                `}
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Nama
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    NIP
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Mata Pelajaran
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Sekolah
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Kontak
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 size={24} className="mx-auto text-[var(--color-primary)] animate-spin mb-2" />
                      <p className="text-sm theme-text-muted">Memuat data guru dari server...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-danger)]">
                      <AlertCircle size={24} className="mx-auto mb-2" />
                      <p className="text-sm font-medium">{error}</p>
                      <button
                        type="button"
                        onClick={fetchGuru}
                        className="mt-3 text-xs font-semibold underline"
                      >
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : filteredGuru.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center"
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

                      <p className="mt-3 text-sm theme-text-muted">
                        Tidak ada data guru yang cocok.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredGuru.map((g, index) => (
                  <tr
                    key={g.id}
                    className={`
                      ${themeNeutralHover}
                      transition-colors
                      ${
                        index !== filteredGuru.length - 1
                          ? `border-b ${themeDivider}`
                          : ""
                      }
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">

                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            ${themePrimarySoft}
                            text-[var(--color-primary)]
                          `}
                        >
                          <GraduationCap className="h-4 w-4" />
                        </div>

                        <span className="font-medium theme-text">
                          {g.nama}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 theme-text-secondary">
                      {g.nip}
                    </td>

                    <td className="px-4 py-3 theme-text-secondary">
                      {g.mapel}
                    </td>

                    <td className="px-4 py-3 theme-text-secondary">
                      {g.sekolah}
                    </td>

                    <td className="px-4 py-3 theme-text-secondary">
                      <div className="flex flex-col gap-1 text-xs">

                        <span className="flex items-center gap-1.5">
                          <Mail
                            className="
                              h-3
                              w-3
                              shrink-0
                              theme-text-muted
                            "
                          />

                          <span className="truncate">
                            {g.email}
                          </span>
                        </span>

                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2
                          py-1
                          text-xs
                          font-medium
                          ${
                            g.status === "Aktif"
                              ? `
                                bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
                                text-[var(--color-success)]
                              `
                              : `
                                bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]
                                text-[var(--color-warning)]
                              `
                          }
                        `}
                      >
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}