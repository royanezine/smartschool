"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Route,
  Trash2,
  Users,
} from "lucide-react";

import {
  deleteGelombangPpdb,
  getGelombangPpdb,
  isGelombangEndpointMissing,
} from "@/services/gelombangPpdb.service";

const themePrimaryText = "text-[var(--color-primary)]";
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";
const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const aktif =
    String(status || "").toLowerCase() === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-semibold ${
        aktif
          ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]"
          : "border-[color-mix(in_srgb,var(--color-text)_16%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-secondary"
      }`}
    >
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default function GelombangSpmbPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menghapus, setMenghapus] = useState("");
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setApiUnavailable(false);

      const response = await getGelombangPpdb();

      setData(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      setData([]);
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat gelombang PPDB.";
      setError(msg);

      setApiUnavailable(
        isGelombangEndpointMissing(err)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  async function hapus(item) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Hapus gelombang "${item.nama}"? Data akan dinonaktifkan (soft delete).`
      )
    ) {
      return;
    }

    try {
      setMenghapus(item.id);
      setError("");

      await deleteGelombangPpdb(item.id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus gelombang."
      );
    } finally {
      setMenghapus("");
    }
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setCollapsed((value) => !value)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/spmb")
              }
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={15} />
              Kembali ke SPMB
            </button>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <CalendarDays size={21} />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Gelombang Pendaftaran
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    Kelola periode, kuota, dan status
                    gelombang SPMB.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className={`theme-neutral-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {loading ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/spmb/gelombang/tambah")
                  }
                  disabled={loading || apiUnavailable}
                  className={`${themePrimaryGradient} inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Plus size={16} />
                  Tambah Gelombang
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 theme-danger"
                />

                <div>
                  <p className="text-xs font-semibold theme-danger">
                    Gagal memuat data gelombang
                  </p>

                  <p className="mt-0.5 text-xs theme-text-secondary">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div
              className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-2xl border ${themeCardShadow}`}
            >
              {loading ? (
                <div className="flex min-h-[360px] items-center justify-center">
                  <div className="text-center">
                    <Loader2
                      size={26}
                      className={`${themePrimaryText} mx-auto animate-spin`}
                    />

                    <p className="theme-text-muted mt-3 text-xs font-medium">
                      Memuat gelombang...
                    </p>
                  </div>
                </div>
              ) : data.length === 0 ? (
                <div className="flex min-h-[360px] items-center justify-center px-6">
                  <div className="text-center">
                    <div
                      className={`theme-text-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface}`}
                    >
                      <CalendarDays size={25} />
                    </div>

                    <h3 className="theme-text mt-4 text-sm font-bold">
                      {apiUnavailable
                        ? "Layanan Gelombang Belum Tersedia"
                        : "Belum ada gelombang"}
                    </h3>

                    <p className="theme-text-muted mt-1 text-xs">
                      {apiUnavailable
                        ? "Server backend belum menyediakan rute untuk manajemen gelombang. Pengaturan jadwal dapat dilakukan pada menu Jalur Pendaftaran."
                        : "Tambahkan gelombang pertama untuk mengatur periode pendaftaran."}
                    </p>

                    {!error && !apiUnavailable && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/spmb/gelombang/tambah"
                          )
                        }
                        className={`${themePrimaryGradient} mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                      >
                        <Plus size={14} />
                        Tambah Gelombang
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                  {data.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-4 p-4 transition sm:flex-row sm:items-center sm:justify-between sm:p-5 ${themeNeutralHover}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="theme-text text-sm font-bold">
                            {item.nama}
                          </p>

                          <StatusBadge
                            status={item.status}
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] theme-text-secondary">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={12} />
                            {formatTanggal(
                              item.tanggalMulai
                            )}{" "}
                            —{" "}
                            {formatTanggal(
                              item.tanggalSelesai
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Route size={12} />
                            {item.jalurPpdb?.nama ||
                              "Semua jalur"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Users size={12} />
                            Kuota:{" "}
                            {item.kuota === null ||
                            item.kuota === undefined
                              ? "Tidak dibatasi"
                              : item.kuota}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/spmb/gelombang/${encodeURIComponent(
                                item.id
                              )}`
                            )
                          }
                          className={`theme-neutral-border theme-text-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => hapus(item)}
                          disabled={menghapus === item.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] px-3 py-1.5 text-[10px] font-semibold theme-danger transition hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {menghapus === item.id ? (
                            <Loader2
                              size={12}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Hapus
                        </button>

                        <ChevronRight
                          size={15}
                          className="theme-text-muted hidden sm:block"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`${themeNeutralBorder} mt-5 rounded-xl border ${themeNeutralSurface} p-4`}
            >
              <p className="theme-text-secondary text-xs leading-5">
                Rute <code>/api/gelombang-ppdb</code> belum dimount di
                Backend, sehingga daftar, tambah, ubah, dan hapus
                gelombang belum dapat digunakan. Halaman ini hanya
                menampilkan state belum tersedia dan tidak memakai data
                contoh. Pengaturan jadwal sementara dapat dilakukan pada
                menu Jalur Pendaftaran.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
