"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Boxes,
  Tag,
  Warehouse,
  MapPin,
  CalendarDays,
  Wrench,
  FileText,
  User,
  Clock3,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  XCircle,
  Edit,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getAset } from "@/services/sarpras.service";

const themeBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

function extractArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.result?.data)) return response.result.data;
  return [];
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatText(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStokStatus(stok, minimum) {
  const current = Number(stok) || 0;
  const min = Number(minimum) || 0;

  if (current <= 0) return "Habis";
  if (current <= min) return "Menipis";
  return "Aman";
}

function DetailItem({ icon: Icon, label, value, full = false }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="mb-1.5 flex items-center gap-2">
        <Icon size={15} className="theme-text-muted shrink-0" />
        <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div
        className={`theme-card min-h-[44px] rounded-xl border ${themeBorder} px-3.5 py-3 text-sm leading-5 theme-text`}
      >
        <span className="break-words">
          {value === null || value === undefined || value === ""
            ? "-"
            : value}
        </span>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section
      className={`theme-card rounded-2xl border ${themeBorder} p-5 ${themeShadow}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
        >
          <Icon size={18} />
        </div>

        <h2 className="theme-text text-sm font-bold">{title}</h2>
      </div>

      {children}
    </section>
  );
}

export default function DetailAsetPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aset, setAset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setError("ID aset tidak ditemukan pada URL.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getAset();
        const list = extractArray(response);
        const found = list.find(
          (item) => String(item?.id) === String(id)
        );

        if (!found) {
          setAset(null);
          setError(
            "Aset tidak ditemukan atau tidak tersedia untuk sekolah ini."
          );
          return;
        }

        setAset(found);
      } catch (err) {
        console.error("Gagal mengambil detail aset:", err);
        setError(
          err?.message || "Gagal mengambil detail aset dari server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const toggleSidebar = () => {
    setIsCollapsed((current) => !current);
  };

  const handleEdit = () => {
    if (!aset?.id) return;
    router.push(`/admin/sarpras/gudang/edit/${aset.id}`);
  };

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <div className="fixed inset-y-0 left-0 z-[60]">
        <Sidebar
          active="gudang"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        <header className="theme-header relative z-50 flex h-[72px] shrink-0 border-b theme-divider">
          <div className="w-full min-w-0">
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
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1500px] space-y-5 px-4 py-5 md:px-6 md:py-7 xl:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/gudang")}
                  className={`theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeBorder} theme-text-secondary transition hover:text-[var(--color-primary)]`}
                  title="Kembali ke daftar aset"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1 className="theme-text text-xl font-bold md:text-2xl">
                    Detail Aset
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Informasi aset berdasarkan data dari server.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadDetail(true)}
                  disabled={refreshing || loading}
                  className={`theme-card inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeBorder} px-4 text-sm font-semibold theme-text-secondary transition disabled:opacity-50`}
                >
                  {refreshing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  Refresh
                </button>

                {aset && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    <Edit size={16} />
                    Edit Aset
                  </button>
                )}
              </div>
            </div>

            {loading && (
              <div
                className={`theme-card flex min-h-[300px] flex-col items-center justify-center rounded-2xl border ${themeBorder} ${themeShadow}`}
              >
                <Loader2
                  size={30}
                  className={`${themePrimaryText} animate-spin`}
                />
                <p className="theme-text mt-4 text-sm font-semibold">
                  Memuat detail aset...
                </p>
                <p className="theme-text-muted mt-1 text-xs">
                  Mengambil data dari server
                </p>
              </div>
            )}

            {!loading && error && (
              <div
                className={`theme-card rounded-2xl border ${themeBorder} p-6 ${themeShadow}`}
              >
                <div className="flex items-start gap-3">
                  <XCircle
                    size={21}
                    className="theme-danger mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="theme-text font-bold">
                      Detail aset gagal dimuat
                    </h2>
                    <p className="theme-text-secondary mt-1 text-sm leading-6">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadDetail()}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"
                    >
                      <RefreshCw size={15} />
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && aset && (
              <>
                <section
                  className={`theme-card rounded-2xl border ${themeBorder} p-5 md:p-6 ${themeShadow}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Package size={27} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="theme-text break-words text-xl font-bold md:text-2xl">
                          {aset.nama || "-"}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            getStokStatus(aset.jumlahStok, aset.stokMinimum) ===
                            "Aman"
                              ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] theme-success"
                              : getStokStatus(
                                    aset.jumlahStok,
                                    aset.stokMinimum
                                  ) === "Menipis"
                                ? "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] theme-warning"
                                : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-danger"
                          }`}
                        >
                          Stok {getStokStatus(aset.jumlahStok, aset.stokMinimum)}
                        </span>
                      </div>

                      <p className="theme-text-secondary mt-2 text-sm">
                        Kode aset:{" "}
                        <span className="font-mono font-semibold">
                          {aset.kode || "-"}
                        </span>
                      </p>

                      <div className="theme-text-muted mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <Tag size={14} />
                          {aset.kategoriAset?.nama || "-"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Warehouse size={14} />
                          {aset.gudang?.nama || "-"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} />
                          {aset.lokasi || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <Section title="Identitas Aset" icon={Database}>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <DetailItem
                      icon={Package}
                      label="Nama Aset"
                      value={aset.nama}
                    />
                    <DetailItem
                      icon={FileText}
                      label="Kode Aset"
                      value={aset.kode}
                    />
                    <DetailItem
                      icon={CheckCircle}
                      label="Status"
                      value={formatText(aset.status)}
                    />
                    <DetailItem
                      icon={Tag}
                      label="Kategori"
                      value={aset.kategoriAset?.nama || aset.kategoriAsetId}
                    />
                    <DetailItem
                      icon={Warehouse}
                      label="Gudang"
                      value={aset.gudang?.nama || aset.gudangId}
                    />
                    <DetailItem
                      icon={MapPin}
                      label="Lokasi"
                      value={aset.lokasi}
                    />
                  </div>
                </Section>

                <Section title="Stok dan Kondisi" icon={Boxes}>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailItem
                      icon={Package}
                      label="Jumlah"
                      value={`${formatNumber(aset.jumlah)} unit`}
                    />
                    <DetailItem
                      icon={Boxes}
                      label="Jumlah Stok"
                      value={`${formatNumber(aset.jumlahStok)} unit`}
                    />
                    <DetailItem
                      icon={AlertTriangle}
                      label="Stok Minimum"
                      value={`${formatNumber(aset.stokMinimum)} unit`}
                    />
                    <DetailItem
                      icon={CheckCircle}
                      label="Kondisi"
                      value={formatText(aset.kondisi)}
                    />
                  </div>
                </Section>

                <Section title="Tanggal dan Perawatan" icon={CalendarDays}>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <DetailItem
                      icon={CalendarDays}
                      label="Tanggal Pembelian"
                      value={formatDate(aset.tanggalPembelian)}
                    />
                    <DetailItem
                      icon={Wrench}
                      label="Perawatan Terakhir"
                      value={formatDate(aset.perawatanTerakhir)}
                    />
                    <DetailItem
                      icon={AlertTriangle}
                      label="Tanggal Rusak"
                      value={formatDate(aset.tanggalRusak)}
                    />
                  </div>
                </Section>

                <Section title="Kerusakan dan Perbaikan" icon={Wrench}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <DetailItem
                      icon={Wrench}
                      label="Status Perbaikan"
                      value={formatText(aset.statusPerbaikan)}
                    />
                    <DetailItem
                      icon={AlertTriangle}
                      label="Deskripsi Kerusakan"
                      value={aset.deskripsiKerusakan}
                      full
                    />
                  </div>
                </Section>

                <Section title="Catatan" icon={FileText}>
                  <div
                    className={`rounded-xl border ${themeBorder} ${themeSurface} p-4 text-sm leading-6 theme-text-secondary`}
                  >
                    {aset.catatan || "Tidak ada catatan."}
                  </div>
                </Section>

                <Section title="Informasi Audit" icon={Clock3}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <DetailItem
                      icon={User}
                      label="Dibuat Oleh"
                      value={aset.dibuatOleh}
                    />
                    <DetailItem
                      icon={User}
                      label="Diperbarui Oleh"
                      value={aset.diperbaruiOleh}
                    />
                    <DetailItem
                      icon={CalendarDays}
                      label="Dibuat Pada"
                      value={formatDateTime(aset.dibuatPada)}
                    />
                    <DetailItem
                      icon={Clock3}
                      label="Diperbarui Pada"
                      value={formatDateTime(aset.diperbaruiPada)}
                    />
                  </div>
                </Section>

                <Section title="Informasi Database" icon={Database}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="theme-text-muted text-[11px] font-semibold uppercase">
                        Aset ID
                      </p>
                      <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                        {aset.id || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="theme-text-muted text-[11px] font-semibold uppercase">
                        Sekolah ID
                      </p>
                      <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                        {aset.sekolahId || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="theme-text-muted text-[11px] font-semibold uppercase">
                        Kategori Aset ID
                      </p>
                      <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                        {aset.kategoriAsetId || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="theme-text-muted text-[11px] font-semibold uppercase">
                        Gudang ID
                      </p>
                      <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                        {aset.gudangId || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="theme-text-muted text-[11px] font-semibold uppercase">
                        Dihapus Pada
                      </p>
                      <p className="theme-text-secondary mt-1 text-xs">
                        {formatDateTime(aset.dihapusPada)}
                      </p>
                    </div>
                  </div>
                </Section>
              </>
            )}

            <footer className="theme-text-muted pb-4 text-center text-[11px]">
              © 2026 SmartSchool • Sarana & Prasarana
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}