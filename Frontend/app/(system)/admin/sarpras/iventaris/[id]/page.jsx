"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  Calendar,
  CheckCircle2,
  Edit,
  Layers,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Tag,
  Trash2,
  Warehouse,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { deleteAset, getAsetById } from "@/services/sarpras.service";
import {
  formatDate,
  formatKondisi,
  formatNumber,
  getStokStatus,
  kondisiBadgeClass,
} from "../_utils";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] theme-text-placeholder">{label}</p>
        <div className="mt-0.5 text-sm font-medium theme-text">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function InventarisDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aset, setAset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) {
      setError("ID inventaris tidak ditemukan pada URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAsetById(id);
      setAset(response?.data || response);
    } catch (err) {
      setAset(null);
      setError(
        err?.message || "Gagal memuat detail inventaris dari server."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, [loadData]);

  async function handleDelete() {
    if (!aset) return;

    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Hapus inventaris "${aset.nama}" (${aset.kode})? Data akan dinonaktifkan.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteAset(aset.id);

      router.push("/admin/sarpras/iventaris");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Gagal menghapus data inventaris.");
      setDeleting(false);
    }
  }

  const stok = aset ? getStokStatus(aset) : null;
  const statusAktif =
    String(aset?.status || "aktif").toLowerCase() === "aktif";

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((value) => !value)}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen((value) => !value)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-5 min-w-0">
            <button
              type="button"
              onClick={() => router.push("/admin/sarpras/iventaris")}
              className="theme-text-muted inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={14} />
              Kembali ke Inventaris
            </button>

            {error && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-danger)]">
                      Gagal memuat detail inventaris
                    </p>
                    <p className="mt-0.5 text-xs theme-text-secondary">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-1.5 text-xs font-semibold theme-text-secondary ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <RefreshCw
                    size={13}
                    className={loading ? "animate-spin" : ""}
                  />
                  Coba lagi
                </button>
              </div>
            )}

            {loading ? (
              <div
                className={`theme-card ${themeNeutralBorder} flex min-h-[420px] items-center justify-center rounded-2xl border ${themeCardShadow}`}
              >
                <div className="text-center">
                  <Loader2
                    size={30}
                    className={`mx-auto animate-spin ${themePrimaryText}`}
                  />
                  <p className="mt-3 text-xs font-medium theme-text-muted">
                    Memuat detail inventaris...
                  </p>
                </div>
              </div>
            ) : !aset ? (
              <div
                className={`theme-card ${themeNeutralBorder} flex min-h-[360px] items-center justify-center rounded-2xl border px-6 ${themeCardShadow}`}
              >
                <div className="max-w-md text-center">
                  <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                  >
                    <Package size={26} />
                  </div>
                  <h1 className="mt-4 text-sm font-bold theme-text">
                    Data inventaris tidak ditemukan
                  </h1>
                  <p className="mt-1 text-xs theme-text-muted">
                    Barang mungkin sudah dihapus atau tidak tersedia untuk
                    sekolah Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/sarpras/iventaris")}
                    className={`mt-4 inline-flex items-center gap-2 rounded-xl border ${themeNeutralBorder} px-4 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover}`}
                  >
                    <ArrowLeft size={13} />
                    Kembali ke daftar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide theme-primary">
                      Detail Inventaris
                    </p>

                    <h1 className="mt-1 truncate text-xl font-bold tracking-tight theme-text sm:text-2xl lg:text-[28px]">
                      {aset.nama}
                    </h1>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm theme-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <Package size={14} className="shrink-0" />
                        {aset.kode}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="shrink-0" />
                        {aset.lokasi || aset.gudang?.lokasi || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/sarpras/iventaris/${encodeURIComponent(
                            aset.id
                          )}/edit`
                        )
                      }
                      className={`theme-card ${themeNeutralBorder} ${themeNeutralHover} inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium theme-text-secondary transition-colors hover:text-[var(--color-primary)]`}
                    >
                      <Edit size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-2.5 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      {deleting ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="space-y-4 lg:col-span-2">
                    <div
                      className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-2xl border ${themeCardShadow}`}
                    >
                      <div
                        className={`flex items-center gap-3 border-b ${themeDivider} px-5 py-4`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <Package size={17} />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold theme-text">
                            Informasi Barang
                          </h2>
                          <p className="text-xs theme-text-muted">
                            Data inventaris yang tersimpan di server
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                        <InfoRow icon={Tag} label="Kategori">
                          {aset.kategoriAset?.nama || "-"}
                        </InfoRow>

                        <InfoRow icon={Warehouse} label="Gudang">
                          {aset.gudang?.nama || "-"}
                        </InfoRow>

                        <InfoRow icon={MapPin} label="Lokasi Fisik">
                          {aset.lokasi || aset.gudang?.lokasi || "-"}
                        </InfoRow>

                        <InfoRow icon={Layers} label="Kondisi">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${kondisiBadgeClass(
                              aset.kondisi
                            )}`}
                          >
                            {formatKondisi(aset.kondisi)}
                          </span>
                        </InfoRow>

                        <InfoRow icon={CheckCircle2} label="Status Aset">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              statusAktif
                                ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]"
                                : "border-[color-mix(in_srgb,var(--color-text)_16%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-secondary"
                            }`}
                          >
                            {statusAktif ? "Aktif" : "Nonaktif"}
                          </span>
                        </InfoRow>

                        <InfoRow icon={Calendar} label="Terdaftar">
                          {formatDate(
                            aset.dibuatPada || aset.createdAt
                          )}
                        </InfoRow>
                      </div>
                    </div>

                    <div
                      className={`theme-card ${themeNeutralBorder} rounded-2xl border p-5 ${themeCardShadow}`}
                    >
                      <h2 className="text-sm font-semibold theme-text">
                        Catatan
                      </h2>

                      <p className="mt-2 text-sm theme-text-secondary">
                        {aset.catatan?.trim()
                          ? aset.catatan
                          : "Belum ada catatan tersimpan untuk barang ini."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div
                      className={`theme-card ${themeNeutralBorder} rounded-2xl border p-5 ${themeCardShadow}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold theme-text">
                          Stok
                        </h2>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stok.className}`}
                        >
                          {stok.label}
                        </span>
                      </div>

                      <p className="mt-4 text-3xl font-bold theme-text">
                        {formatNumber(aset.jumlahStok)}{" "}
                        <span className="text-sm font-medium theme-text-muted">
                          tersedia
                        </span>
                      </p>

                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="theme-text-secondary">
                            Jumlah unit
                          </span>
                          <span className="font-semibold theme-text">
                            {formatNumber(aset.jumlah)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="theme-text-secondary">
                            Stok minimum
                          </span>
                          <span className="font-semibold theme-text">
                            {formatNumber(aset.stokMinimum)}
                          </span>
                        </div>
                        <div
                          className={`h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                        >
                          <div
                            className={`h-full rounded-full ${themePrimaryGradient}`}
                            style={{
                              width: `${
                                Number(aset.jumlah) > 0
                                  ? Math.min(
                                      100,
                                      (Number(aset.jumlahStok) /
                                        Number(aset.jumlah)) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-[11px] theme-text-muted">
                        Stok diperbarui melalui proses peminjaman dan
                        pengembalian sarpras.
                      </p>
                    </div>

                    <div
                      className={`theme-card ${themeNeutralBorder} rounded-2xl border p-5 ${themeCardShadow}`}
                    >
                      <h2 className="text-sm font-semibold theme-text">
                        Riwayat Data
                      </h2>

                      <div className="mt-3 space-y-3">
                        <div>
                          <p className="text-[11px] theme-text-placeholder">
                            Terakhir diperbarui
                          </p>
                          <p className="mt-0.5 text-sm font-medium theme-text">
                            {formatDate(
                              aset.diperbaruiPada ||
                                aset.updatedAt ||
                                aset.dibuatPada
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] theme-text-placeholder">
                            ID Aset
                          </p>
                          <p className="mt-0.5 break-all text-xs theme-text-secondary">
                            {aset.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
