"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  CalendarDays,
  School,
  Hash,
  Pencil,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getGedung,
  getLantaiByGedung,
} from "@/services/infrastruktur.service";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeButtonShadow =
  "shadow-[0_4px_12px_color-mix(in_srgb,var(--color-text)_12%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

export default function DetailLantaiPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [data, setData] = useState(null);
  const [gedung, setGedung] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  async function loadDetail() {
    try {
      setLoading(true);
      setError("");

      const gedungResult = await getGedung();

      if (!gedungResult?.success) {
        throw new Error(
          gedungResult?.message || "Gagal mengambil data gedung."
        );
      }

      const gedungList = gedungResult.data || [];

      let foundLantai = null;
      let foundGedung = null;

      for (const item of gedungList) {
        const result = await getLantaiByGedung(item.id);

        if (!result?.success) {
          continue;
        }

        const lantaiList = result.data || [];

        const found = lantaiList.find(
          (lantai) => String(lantai.id) === String(id)
        );

        if (found) {
          foundLantai = found;
          foundGedung = item;
          break;
        }
      }

      if (!foundLantai) {
        throw new Error("Data lantai tidak ditemukan.");
      }

      setData(foundLantai);
      setGedung(foundGedung);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Gagal mengambil detail lantai.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={false}
          setCollapsed={() => {}}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="theme-page flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2
                size={34}
                className="animate-spin text-[var(--color-primary)]"
              />

              <p className="theme-text-secondary text-sm font-medium">
                Memuat detail lantai...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR / DATA TIDAK DITEMUKAN
  // ============================================================

  if (error || !data) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={false}
          setCollapsed={() => {}}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="theme-page flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6">
            <div className="w-full max-w-2xl">
              <button
                onClick={() =>
                  router.push("/admin/sarpras/gedung/lantai")
                }
                className={`theme-text-muted mb-6 inline-flex items-center gap-2 text-sm font-medium transition ${themePrimaryHover}`}
              >
                <ArrowLeft size={17} />
                Kembali
              </button>

              <div
                className={`rounded-2xl border p-6 ${themeDangerBorder} ${themeDangerSurface} ${themeCardShadow}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeSoftSurface}`}
                  >
                    <AlertCircle
                      size={21}
                      className="theme-danger"
                    />
                  </div>

                  <div>
                    <h2 className="theme-danger font-semibold">
                      Data tidak ditemukan
                    </h2>

                    <p className="theme-text-secondary mt-1 text-sm">
                      {error || "Data lantai tidak tersedia."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const kelas = Array.isArray(data.kelas) ? data.kelas : [];

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={() => {}}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-6xl space-y-6">

              {/* ============================================================
                  HEADER SECTION
              ============================================================ */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <button
                    onClick={() =>
                      router.push("/admin/sarpras/gedung/lantai")
                    }
                    className={`theme-text-muted mb-3 inline-flex items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]`}
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Data Lantai
                  </button>

                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                    Detail Lantai
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm">
                    Informasi lengkap lantai dan kelas yang menggunakannya.
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(`/admin/sarpras/lantai/edit/${data.id}`)
                  }
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-[var(--color-card)] transition-all ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 active:scale-[0.98]`}
                >
                  <Pencil size={17} />
                  Edit Lantai
                </button>
              </div>

              {/* ============================================================
                  OVERVIEW CARDS
              ============================================================ */}

              <div className="grid gap-4 sm:grid-cols-3">

                {/* NAMA */}
                <div
                  className={`theme-card theme-border group rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${themeCardShadow} ${themeCardHoverShadow}`}
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <Layers3 size={20} />
                  </div>

                  <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
                    Nama Lantai
                  </p>

                  <h2 className="theme-text mt-2 text-xl font-bold">
                    {data.nama || "-"}
                  </h2>
                </div>

                {/* GEDUNG */}
                <div
                  className={`theme-card theme-border group rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${themeCardShadow} ${themeCardHoverShadow}`}
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-info),color-mix(in_srgb,var(--color-info)_72%,var(--color-primary)))] text-[var(--color-card)] ${themeButtonShadow}`}
                  >
                    <Building2 size={20} />
                  </div>

                  <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
                    Gedung
                  </p>

                  <h2 className="theme-text mt-2 text-xl font-bold">
                    {gedung?.nama || "-"}
                  </h2>

                  {gedung?.kode && (
                    <p className="theme-text-muted mt-1 text-xs">
                      Kode: {gedung.kode}
                    </p>
                  )}
                </div>

                {/* JUMLAH KELAS */}
                <div
                  className={`theme-card theme-border group rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${themeCardShadow} ${themeCardHoverShadow}`}
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-success),color-mix(in_srgb,var(--color-success)_70%,var(--color-info)))] text-[var(--color-card)] ${themeButtonShadow}`}
                  >
                    <School size={20} />
                  </div>

                  <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
                    Jumlah Kelas
                  </p>

                  <h2 className="theme-text mt-2 text-xl font-bold">
                    {kelas.length}
                  </h2>

                  <p className="theme-text-muted mt-1 text-xs">
                    kelas menggunakan lantai ini
                  </p>
                </div>
              </div>

              {/* ============================================================
                  DETAIL INFORMATION
              ============================================================ */}

              <div
                className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}
              >
                <div
                  className={`theme-border border-b px-6 py-5 sm:px-8 ${themeSoftSurface}`}
                >
                  <h2 className="theme-text text-base font-semibold">
                    Informasi Lantai
                  </h2>

                  <p className="theme-text-muted mt-1 text-sm">
                    Detail data yang tersimpan pada sistem.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2">

                  {/* ID */}
                  <div className="theme-border flex gap-4 border-b p-5 sm:border-r">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeSoftSurface} theme-text-secondary`}
                    >
                      <Hash size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
                        ID Lantai
                      </p>

                      <p className="theme-text-secondary mt-1 break-all font-mono text-sm font-medium">
                        {data.id}
                      </p>
                    </div>
                  </div>

                  {/* GEDUNG ID */}
                  <div className="theme-border flex gap-4 border-b p-5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
                    >
                      <Building2 size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
                        ID Gedung
                      </p>

                      <p className="theme-text-secondary mt-1 break-all font-mono text-sm font-medium">
                        {data.gedungId || gedung?.id || "-"}
                      </p>
                    </div>
                  </div>

                  {/* TANGGAL */}
                  <div className="theme-border flex gap-4 border-b p-5 sm:border-r sm:border-b-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeInfoSurface} theme-info`}
                    >
                      <CalendarDays size={19} />
                    </div>

                    <div>
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
                        Dibuat Pada
                      </p>

                      <p className="theme-text-secondary mt-1 text-sm font-medium">
                        {formatDate(data.dibuatPada)}
                      </p>
                    </div>
                  </div>

                  {/* TOTAL KELAS */}
                  <div className="flex gap-4 p-5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeSuccessSurface} theme-success`}
                    >
                      <Users size={19} />
                    </div>

                    <div>
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
                        Total Kelas
                      </p>

                      <p className="theme-text-secondary mt-1 text-sm font-medium">
                        {kelas.length} kelas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================
                  KELAS TABLE
              ============================================================ */}

              <div
                className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}
              >
                <div
                  className={`theme-border flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${themeSoftSurface}`}
                >
                  <div>
                    <h2 className="theme-text text-base font-semibold">
                      Kelas di Lantai Ini
                    </h2>

                    <p className="theme-text-muted mt-1 text-sm">
                      Daftar kelas yang terhubung dengan lantai.
                    </p>
                  </div>

                  <div
                    className={`theme-text-secondary inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${themeSoftSurface}`}
                  >
                    <School size={16} />
                    {kelas.length} Kelas
                  </div>
                </div>

                {kelas.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div
                      className={`theme-text-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themeSoftSurface}`}
                    >
                      <School size={28} />
                    </div>

                    <h3 className="theme-text-secondary mt-4 text-sm font-semibold">
                      Belum ada kelas
                    </h3>

                    <p className="theme-text-muted mt-1 text-xs">
                      Belum ada kelas yang menggunakan lantai ini.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr
                          className={`theme-border border-b ${themeSoftSurface}`}
                        >
                          <th className="theme-text-muted px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                            No
                          </th>

                          <th className="theme-text-muted px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                            Nama Kelas
                          </th>

                          <th className="theme-text-muted px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                            Tingkat
                          </th>

                          <th className="theme-text-muted px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                            ID Kelas
                          </th>
                        </tr>
                      </thead>

                      <tbody
                        className={`divide-y ${"divide-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"}`}
                      >
                        {kelas.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`transition-colors ${themeNeutralHover}`}
                          >
                            <td className="theme-text-muted px-6 py-4 text-sm">
                              {index + 1}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
                                >
                                  <School size={17} />
                                </div>

                                <span className="theme-text-secondary text-sm font-semibold">
                                  {item.nama || "-"}
                                </span>
                              </div>
                            </td>

                            <td className="theme-text-secondary px-6 py-4 text-sm">
                              {item.tingkat || "-"}
                            </td>

                            <td className="px-6 py-4">
                              <span className="theme-text-muted font-mono text-xs">
                                {item.id}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}