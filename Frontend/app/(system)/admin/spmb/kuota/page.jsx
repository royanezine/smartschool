"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  Info,
  Loader2,
  RefreshCw,
  Route,
  Users,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getJalurPpdb } from "@/services/jalurPpdb.service";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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

export default function KuotaSpmbPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getJalurPpdb();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal mengambil data kuota jalur PPDB."
        );
      }

      setData(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      setData([]);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data kuota jalur PPDB."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, [loadData]);

  const totalKuota = useMemo(
    () =>
      data.reduce(
        (total, item) =>
          total + Number(item?.kuota || 0),
        0
      ),
    [data]
  );

  const jalurAktif = useMemo(
    () =>
      data.filter(
        (item) =>
          String(item?.status || "").toLowerCase() ===
          "aktif"
      ).length,
    [data]
  );

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
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="theme-text text-xl font-bold sm:text-2xl">
                  Kuota SPMB
                </h1>

                <p className="theme-text-secondary mt-1 text-sm">
                  Kuota per jalur pendaftaran yang
                  tersimpan di database.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/spmb/jalur")
                  }
                  className={`${themePrimaryGradient} inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                >
                  <Route size={15} />
                  Kelola Jalur
                </button>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className={`theme-neutral-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {refreshing ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                  Refresh
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
                  <p className="theme-danger text-sm font-semibold">
                    Gagal memuat kuota
                  </p>

                  <p className="theme-text-secondary mt-0.5 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat
                title="Total Kuota"
                value={totalKuota}
                icon={Users}
              />

              <Stat
                title="Jumlah Jalur"
                value={data.length}
                icon={Route}
              />

              <Stat
                title="Jalur Aktif"
                value={jalurAktif}
                icon={CalendarDays}
              />
            </div>

            <div
              className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-xl border ${themeCardShadow}`}
            >
              {loading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <div className="text-center">
                    <Loader2
                      size={26}
                      className={`${themePrimaryText} mx-auto animate-spin`}
                    />

                    <p className="theme-text-muted mt-3 text-xs">
                      Memuat kuota jalur...
                    </p>
                  </div>
                </div>
              ) : data.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div
                    className={`theme-text-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface}`}
                  >
                    <Route size={24} />
                  </div>

                  <h2 className="theme-text mt-4 text-sm font-bold">
                    Belum ada jalur pendaftaran
                  </h2>

                  <p className="theme-text-muted mx-auto mt-1 max-w-md text-xs leading-5">
                    Tambahkan jalur pendaftaran terlebih
                    dahulu untuk menentukan kuota.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr
                        className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                      >
                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                          Jalur
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                          Kuota
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                          Periode
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((item) => (
                        <tr
                          key={item.id}
                          className={`border-b ${themeDivider} last:border-0`}
                        >
                          <td className="theme-text px-4 py-4 text-sm font-semibold">
                            {item.nama || "-"}
                          </td>

                          <td className="theme-text-secondary px-4 py-4 text-sm">
                            {Number(
                              item.kuota || 0
                            ).toLocaleString("id-ID")}
                          </td>

                          <td className="theme-text-secondary px-4 py-4 text-xs">
                            {formatTanggal(
                              item.tanggalMulai
                            )}{" "}
                            -{" "}
                            {formatTanggal(
                              item.tanggalSelesai
                            )}
                          </td>

                          <td className="theme-text-secondary px-4 py-4 text-xs capitalize">
                            {item.status || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              className={`${themeNeutralSurface} ${themeNeutralBorder} mt-4 flex items-start gap-2.5 rounded-xl border p-4`}
            >
              <Info
                size={15}
                className={`mt-0.5 shrink-0 ${themePrimaryText}`}
              />

              <p className="theme-text-secondary text-xs leading-5">
                Jumlah pendaftar terisi per jalur belum
                dapat dihitung karena endpoint daftar
                pendaftar belum tersedia. Kuota dapat
                diubah melalui menu Jalur Pendaftaran
                (PUT /api/jalur-ppdb/:id).
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-4 ${themeCardShadow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="theme-text-muted text-xs">
            {title}
          </p>

          <p className="theme-text mt-1 text-2xl font-bold">
            {Number(value || 0).toLocaleString(
              "id-ID"
            )}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft}`}
        >
          <Icon
            size={18}
            className={themePrimaryText}
          />
        </div>
      </div>
    </div>
  );
}
