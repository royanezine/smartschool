
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Warehouse,
  ArrowLeft,
  MapPin,
  Package,
  Boxes,
  Tag,
  Hash,
  CalendarDays,
  Info,
  RefreshCw,
  Loader2,
  AlertCircle,
  Edit,
  ClipboardList,
} from "lucide-react";

import { getDetailGudang } from "@/services/sarpras.service";

const neutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const neutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const primarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const cardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

function extractObject(response) {
  let result = response;

  for (let i = 0; i < 4; i++) {
    if (!result || typeof result !== "object") break;

    if (result.id && result.nama) return result;

    if (result.data) {
      result = result.data;
      continue;
    }

    if (result.result) {
      result = result.result;
      continue;
    }

    break;
  }

  return result && typeof result === "object" ? result : null;
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getJumlah(aset) {
  return Number(aset?.jumlahStok ?? aset?.jumlah ?? aset?.stok ?? 0);
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className={`theme-card rounded-xl border ${neutralBorder} p-4`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-1 break-words text-sm font-semibold">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div
      className={`theme-card rounded-xl border ${neutralBorder} ${cardShadow} p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-2 text-2xl font-bold">
            {formatNumber(value)}
          </p>

          <p className="theme-text-muted mt-1 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function DetailGudangPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [gudang, setGudang] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = useCallback(async (showRefresh = false) => {
    if (!id) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDetailGudang(id);
      const data = extractObject(response);

      if (!data?.id) {
        throw new Error("Data detail gudang tidak ditemukan.");
      }

      setGudang(data);
    } catch (err) {
      console.error("Gagal mengambil detail gudang:", err);
      setError(err?.message || "Gagal mengambil detail gudang.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const asetList = Array.isArray(gudang?.aset)
    ? gudang.aset
    : [];

  const totalUnit = asetList.reduce(
    (total, aset) => total + getJumlah(aset),
    0
  );

  const totalStokMinimum = asetList.reduce(
    (total, aset) => total + Number(aset?.stokMinimum || 0),
    0
  );

  const toggleSidebar = () => {
    setIsCollapsed((current) => !current);
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/gudang/master")}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${neutralBorder} theme-card theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]`}
                  title="Kembali"
                >
                  <ArrowLeft size={18} />
                </button>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
                >
                  <Warehouse size={23} />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Detail Gudang
                  </h1>

                  <p className="theme-text-muted mt-1 text-xs sm:text-sm">
                    Informasi lengkap gudang dan aset yang tersimpan.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadDetail(true)}
                  disabled={refreshing || loading}
                  className={`theme-card theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border ${neutralBorder} px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50`}
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                {gudang?.id && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/sarpras/gudang/master/edit/${gudang.id}`
                      )
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110"
                  >
                    <Edit size={15} />
                    Edit Gudang
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] p-4 text-[var(--color-danger)]">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    Gagal mengambil detail gudang
                  </p>

                  <p className="mt-1 text-xs">{error}</p>

                  <button
                    type="button"
                    onClick={() => loadDetail()}
                    className="mt-2 text-xs font-semibold underline"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div
                className={`theme-card flex min-h-[350px] flex-col items-center justify-center rounded-2xl border ${neutralBorder}`}
              >
                <Loader2
                  size={32}
                  className="animate-spin text-[var(--color-primary)]"
                />

                <p className="theme-text mt-4 text-sm font-semibold">
                  Memuat detail gudang...
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Mengambil informasi dari server.
                </p>
              </div>
            ) : gudang ? (
              <>
                <div
                  className={`theme-card overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow}`}
                >
                  <div className="flex flex-col gap-4 border-b theme-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${primarySoft} text-[var(--color-primary)]`}
                      >
                        <Warehouse size={28} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          Nama Gudang
                        </p>

                        <h2 className="theme-text mt-1 break-words text-xl font-bold sm:text-2xl">
                          {gudang.nama || "-"}
                        </h2>

                        <p className="theme-text-muted mt-1 flex items-center gap-1.5 text-xs">
                          <MapPin size={13} />
                          {gudang.lokasi || "Lokasi belum diisi"}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]">
                      <ClipboardList size={14} />
                      Data Gudang
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                    <InfoCard
                      icon={Warehouse}
                      label="Nama Gudang"
                      value={gudang.nama}
                    />

                    <InfoCard
                      icon={MapPin}
                      label="Lokasi"
                      value={gudang.lokasi}
                    />

                    <InfoCard
                      icon={Hash}
                      label="ID Gudang"
                      value={gudang.id}
                    />

                    <InfoCard
                      icon={CalendarDays}
                      label="Tanggal Dibuat"
                      value={formatDate(
                        gudang.dibuatPada || gudang.createdAt
                      )}
                    />

                    <InfoCard
                      icon={Package}
                      label="Jumlah Jenis Aset"
                      value={`${formatNumber(asetList.length)} jenis`}
                    />

                    <InfoCard
                      icon={Boxes}
                      label="Jumlah Seluruh Unit"
                      value={`${formatNumber(totalUnit)} unit`}
                    />
                  </div>

                  <div className={`border-t ${neutralBorder} p-5 sm:p-6`}>
                    <div className="mb-2 flex items-center gap-2">
                      <Info
                        size={17}
                        className="text-[var(--color-primary)]"
                      />

                      <h3 className="theme-text text-sm font-bold">
                        Keterangan Gudang
                      </h3>
                    </div>

                    <p className="theme-text-secondary whitespace-pre-wrap text-sm leading-relaxed">
                      {gudang.keterangan || "Tidak ada keterangan gudang."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatCard
                    icon={Package}
                    label="Jenis Aset"
                    value={asetList.length}
                    description="Aset terdaftar di gudang"
                  />

                  <StatCard
                    icon={Boxes}
                    label="Total Unit"
                    value={totalUnit}
                    description="Jumlah seluruh stok aset"
                  />

                  <StatCard
                    icon={ClipboardList}
                    label="Total Stok Minimum"
                    value={totalStokMinimum}
                    description="Akumulasi stok minimum aset"
                  />
                </div>

                <div
                  className={`theme-card overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow}`}
                >
                  <div className="flex flex-col gap-2 border-b theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="theme-text text-base font-bold">
                        Daftar Aset Gudang
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Seluruh aset yang tersimpan di gudang ini.
                      </p>
                    </div>

                    <span
                      className={`${neutralSurface} theme-text-secondary w-fit rounded-full px-3 py-1.5 text-xs font-semibold`}
                    >
                      {asetList.length} jenis aset
                    </span>
                  </div>

                  {asetList.length === 0 ? (
                    <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${neutralSurface} theme-text-muted`}
                      >
                        <Package size={29} />
                      </div>

                      <h3 className="theme-text mt-4 text-sm font-bold">
                        Belum Ada Aset
                      </h3>

                      <p className="theme-text-muted mt-1 max-w-sm text-xs">
                        Belum ada aset yang terdaftar pada gudang ini.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px] text-sm">
                        <thead>
                          <tr
                            className={`${neutralSurface} border-b theme-border text-left`}
                          >
                            <th className="theme-text-muted px-5 py-4 text-[10px] font-bold uppercase tracking-wider">
                              Nama Aset
                            </th>

                            <th className="theme-text-muted px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                              Kode
                            </th>

                            <th className="theme-text-muted px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                              Kategori
                            </th>

                            <th className="theme-text-muted px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                              Jumlah
                            </th>

                            <th className="theme-text-muted px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                              Stok Minimum
                            </th>

                            <th className="theme-text-muted px-5 py-4 text-[10px] font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--color-border-soft)]">
                          {asetList.map((aset) => (
                            <tr
                              key={aset.id}
                              className="transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${primarySoft} text-[var(--color-primary)]`}
                                  >
                                    <Package size={16} />
                                  </div>

                                  <span className="theme-text text-xs font-semibold">
                                    {aset.nama || "-"}
                                  </span>
                                </div>
                              </td>

                              <td className="theme-text-secondary px-4 py-4 text-xs">
                                {aset.kode || "-"}
                              </td>

                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-2.5 py-1.5 text-xs theme-text-secondary">
                                  <Tag size={12} />
                                  {aset.kategoriAset?.nama ||
                                    aset.kategoriAset?.namaKategori ||
                                    "-"}
                                </span>
                              </td>

                              <td className="theme-text px-4 py-4 text-xs font-semibold">
                                {formatNumber(getJumlah(aset))}
                              </td>

                              <td className="theme-text-secondary px-4 py-4 text-xs">
                                {formatNumber(aset.stokMinimum)}
                              </td>

                              <td className="theme-text-secondary px-5 py-4 text-xs">
                                {aset.kondisi ||
                                  aset.statusKondisi ||
                                  "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className={`border-t ${neutralBorder} ${neutralSurface} px-5 py-3`}>
                    <p className="theme-text-muted text-xs">
                      Menampilkan {asetList.length} jenis aset dengan total{" "}
                      <strong className="theme-text">
                        {formatNumber(totalUnit)} unit
                      </strong>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div
                className={`theme-card flex min-h-[300px] flex-col items-center justify-center rounded-2xl border ${neutralBorder} p-6 text-center`}
              >
                <Warehouse size={34} className="theme-text-muted" />

                <h3 className="theme-text mt-4 text-base font-bold">
                  Gudang Tidak Ditemukan
                </h3>

                <p className="theme-text-muted mt-1 text-sm">
                  Data gudang tidak tersedia atau sudah dihapus.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/gudang/master")}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-card)]"
                >
                  <ArrowLeft size={15} />
                  Kembali ke Daftar Gudang
                </button>
              </div>
            )}

            <footer className="border-t theme-border py-5 text-center text-[11px] theme-text-muted">
              © 2026 SmartSchool • Detail Gudang Sarana & Prasarana
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
